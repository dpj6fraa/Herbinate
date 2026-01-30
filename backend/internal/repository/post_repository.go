package repository

import (
	"database/sql"
	"time"

	"myapp/internal/domain"
)

type PostRepository struct {
	DB *sql.DB
}

func (r *PostRepository) Create(post *domain.Post) error {
	_, err := r.DB.Exec(`
		INSERT INTO posts (id, user_id, title, content, created_at)
		VALUES ($1, $2, $3, $4, $5)
	`, post.ID, post.UserID, post.Title, post.Content, time.Now())

	return err
}

func (r *PostRepository) AddImage(img *domain.PostImage) error {
	_, err := r.DB.Exec(`
		INSERT INTO post_images (id, post_id, image_url, position)
		VALUES ($1, $2, $3, $4)
	`, img.ID, img.PostID, img.URL, img.Order)

	return err
}

func (r *PostRepository) GetFeed() (*sql.Rows, error) {
	return r.DB.Query(`
		SELECT 
			p.id, p.title, p.content, p.created_at,
			u.username,
			ps.like_count, ps.comment_count, ps.share_count
		FROM posts p
		JOIN users u ON u.id = p.user_id
		LEFT JOIN post_stats ps ON ps.id = p.id
		ORDER BY p.created_at DESC
	`)
}

func (r *PostRepository) GetFeedWithUser(userID string) (*sql.Rows, error) {
	return r.DB.Query(`
		SELECT 
			p.id, p.title, p.content, p.created_at,
			u.username,
			ps.like_count, ps.comment_count, ps.share_count,
			CASE WHEN pl.user_id IS NULL THEN false ELSE true END AS liked
		FROM posts p
		JOIN users u ON u.id = p.user_id
		LEFT JOIN post_stats ps ON ps.id = p.id
		LEFT JOIN post_likes pl 
			ON pl.post_id = p.id AND pl.user_id = $1
		ORDER BY p.created_at DESC
	`, userID)
}

// ---------------- IMAGES ----------------

func (r *PostRepository) GetImages(postID string) ([]domain.PostImage, error) {
	rows, err := r.DB.Query(`
		SELECT id, post_id, image_url, position
		FROM post_images
		WHERE post_id = $1
		ORDER BY position ASC
	`, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var images []domain.PostImage
	for rows.Next() {
		var img domain.PostImage
		rows.Scan(&img.ID, &img.PostID, &img.URL, &img.Order)
		images = append(images, img)
	}
	return images, nil
}

func (r *PostRepository) DeletePost(postID, userID string) error {
	_, err := r.DB.Exec(`
		DELETE FROM posts
		WHERE id = $1 AND user_id = $2
	`, postID, userID)
	return err
}

// ---------------- LIKES ----------------

func (r *PostRepository) Like(postID, userID string) error {
	_, err := r.DB.Exec(`
		INSERT INTO post_likes (id, post_id, user_id)
		VALUES (gen_random_uuid(), $1, $2)
		ON CONFLICT DO NOTHING
	`, postID, userID)
	return err
}

func (r *PostRepository) Unlike(postID, userID string) error {
	_, err := r.DB.Exec(`
		DELETE FROM post_likes WHERE post_id = $1 AND user_id = $2
	`, postID, userID)
	return err
}

// ---------------- COMMENTS ----------------

func (r *PostRepository) AddComment(c *domain.PostComment) error {
	_, err := r.DB.Exec(`
		INSERT INTO post_comments (id, post_id, user_id, content, created_at)
		VALUES ($1, $2, $3, $4, NOW())
	`, c.ID, c.PostID, c.UserID, c.Content)
	return err
}

func (r *PostRepository) GetComments(postID string) ([]domain.CommentWithUser, error) {
	rows, err := r.DB.Query(`
		SELECT 
			c.id,
			c.user_id,
			u.username,
			u.profile_image_url,
			c.content,
			c.created_at
		FROM post_comments c
		JOIN users u ON u.id = c.user_id
		WHERE c.post_id = $1
		ORDER BY c.created_at DESC
	`, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []domain.CommentWithUser
	for rows.Next() {
		var c domain.CommentWithUser
		rows.Scan(&c.ID, &c.UserID, &c.Username, &c.Profile, &c.Content, &c.CreatedAt)
		comments = append(comments, c)
	}
	return comments, nil
}

// ---------------- SHARES ----------------

// internal/repository/post.go

func (r *PostRepository) Share(postID, userID string) (bool, error) {
	result, err := r.DB.Exec(`
		INSERT INTO post_shares (id, post_id, user_id, created_at)
		VALUES (gen_random_uuid(), $1, $2, NOW())
		ON CONFLICT (post_id, user_id) DO NOTHING
	`, postID, userID)

	if err != nil {
		return false, err
	}

	rows, _ := result.RowsAffected()
	return rows > 0, nil // ✅ return true ถ้า insert สำเร็จ
}

func (r *PostRepository) GetPostDetail(postID string) (map[string]interface{}, error) {
	row := r.DB.QueryRow(`
		SELECT 
			p.id, p.title, p.content, p.created_at,
			u.username, u.profile_image_url,
			ps.like_count, ps.comment_count, ps.share_count
		FROM posts p
		JOIN users u ON u.id = p.user_id
		LEFT JOIN post_stats ps ON ps.id = p.id
		WHERE p.id = $1
	`, postID)

	var id, title, content, username, profileImage sql.NullString
	var createdAt time.Time
	var likes, comments, shares sql.NullInt64

	err := row.Scan(&id, &title, &content, &createdAt, &username, &profileImage, &likes, &comments, &shares)
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"id":         id.String,
		"title":      title.String,
		"content":    content.String,
		"createdAt":  createdAt,
		"username":   username.String,
		"profileImg": profileImage.String,
		"likes":      likes.Int64,
		"comments":   comments.Int64,
		"shares":     shares.Int64,
	}, nil
}

func (r *PostRepository) GetCommentWithUser(commentID string) (domain.CommentWithUser, error) {
	row := r.DB.QueryRow(`
		SELECT 
			c.id,
			c.user_id,
			u.username,
			u.profile_image_url,
			c.content,
			c.created_at
		FROM post_comments c
		JOIN users u ON u.id = c.user_id
		WHERE c.id = $1
	`, commentID)

	var c domain.CommentWithUser
	err := row.Scan(&c.ID, &c.UserID, &c.Username, &c.Profile, &c.Content, &c.CreatedAt)
	return c, err
}
