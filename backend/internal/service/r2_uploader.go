package service

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
	"path"
	"strings"
	"time"

	"github.com/google/uuid"
)

type R2Config struct {
	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
	Bucket          string
	PublicURL       string
}

func loadR2Config() R2Config {
	return R2Config{
		AccountID:       firstEnv("R2_ACCOUNT_ID", "CLOUDFLARE_R2_ACCOUNT_ID"),
		AccessKeyID:     firstEnv("R2_ACCESS_KEY_ID", "CLOUDFLARE_R2_ACCESS_KEY_ID"),
		SecretAccessKey: firstEnv("R2_SECRET_ACCESS_KEY", "CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
		Bucket:          firstEnv("R2_BUCKET", "R2_BUCKET_NAME", "CLOUDFLARE_R2_BUCKET"),
		PublicURL:       firstEnv("R2_PUBLIC_URL", "CLOUDFLARE_R2_PUBLIC_URL"),
	}
}

func firstEnv(keys ...string) string {
	for _, key := range keys {
		if value := strings.TrimSpace(os.Getenv(key)); value != "" {
			return value
		}
	}
	return ""
}

func R2Configured() bool {
	cfg := loadR2Config()
	return cfg.AccountID != "" &&
		cfg.AccessKeyID != "" &&
		cfg.SecretAccessKey != "" &&
		cfg.Bucket != "" &&
		cfg.PublicURL != ""
}

func UploadImageToR2(ctx context.Context, file multipart.File, originalName, contentType, folder string) (string, error) {
	cfg := loadR2Config()
	if !R2Configured() {
		return "", fmt.Errorf("r2 is not configured")
	}

	ext := strings.ToLower(path.Ext(originalName))
	if ext == "" {
		ext = ".jpg"
	}

	objectKey := strings.Trim(folder, "/") + "/" + uuid.NewString() + ext
	endpoint := fmt.Sprintf("https://%s.r2.cloudflarestorage.com/%s/%s", cfg.AccountID, cfg.Bucket, objectKey)

	body, err := io.ReadAll(file)
	if err != nil {
		return "", err
	}
	if contentType == "" {
		contentType = http.DetectContentType(body)
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodPut, endpoint, bytes.NewReader(body))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", contentType)
	req.Header.Set("Content-Length", fmt.Sprintf("%d", len(body)))

	signR2Request(req, cfg, body)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode < http.StatusOK || resp.StatusCode >= http.StatusMultipleChoices {
		errBody, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("r2 upload failed: %s %s", resp.Status, string(errBody))
	}

	return strings.TrimRight(cfg.PublicURL, "/") + "/" + objectKey, nil
}

func signR2Request(req *http.Request, cfg R2Config, body []byte) {
	now := time.Now().UTC()
	amzDate := now.Format("20060102T150405Z")
	dateStamp := now.Format("20060102")
	region := "auto"
	serviceName := "s3"
	credentialScope := dateStamp + "/" + region + "/" + serviceName + "/aws4_request"
	payloadHash := sha256Hex(body)
	host := req.URL.Host

	req.Header.Set("Host", host)
	req.Header.Set("X-Amz-Date", amzDate)
	req.Header.Set("X-Amz-Content-Sha256", payloadHash)

	canonicalHeaders := "content-type:" + strings.TrimSpace(req.Header.Get("Content-Type")) + "\n" +
		"host:" + host + "\n" +
		"x-amz-content-sha256:" + payloadHash + "\n" +
		"x-amz-date:" + amzDate + "\n"
	signedHeaders := "content-type;host;x-amz-content-sha256;x-amz-date"
	canonicalRequest := strings.Join([]string{
		req.Method,
		req.URL.EscapedPath(),
		canonicalQuery(req.URL.Query()),
		canonicalHeaders,
		signedHeaders,
		payloadHash,
	}, "\n")

	stringToSign := strings.Join([]string{
		"AWS4-HMAC-SHA256",
		amzDate,
		credentialScope,
		sha256Hex([]byte(canonicalRequest)),
	}, "\n")

	signingKey := awsSigningKey(cfg.SecretAccessKey, dateStamp, region, serviceName)
	signature := hex.EncodeToString(hmacSHA256(signingKey, stringToSign))
	req.Header.Set("Authorization",
		"AWS4-HMAC-SHA256 Credential="+cfg.AccessKeyID+"/"+credentialScope+
			", SignedHeaders="+signedHeaders+
			", Signature="+signature)
}

func canonicalQuery(values url.Values) string {
	return values.Encode()
}

func sha256Hex(data []byte) string {
	hash := sha256.Sum256(data)
	return hex.EncodeToString(hash[:])
}

func hmacSHA256(key []byte, data string) []byte {
	mac := hmac.New(sha256.New, key)
	mac.Write([]byte(data))
	return mac.Sum(nil)
}

func awsSigningKey(secret, date, region, serviceName string) []byte {
	dateKey := hmacSHA256([]byte("AWS4"+secret), date)
	dateRegionKey := hmacSHA256(dateKey, region)
	dateRegionServiceKey := hmacSHA256(dateRegionKey, serviceName)
	return hmacSHA256(dateRegionServiceKey, "aws4_request")
}
