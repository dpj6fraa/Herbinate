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
		INSERT INTO post_images (id, post_id, url, "order")
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

// ---------------- IMAGES ----------------

func (r *PostRepository) GetImages(postID string) ([]domain.PostImage, error) {
	rows, err := r.DB.Query(`
		SELECT id, post_id, url, "order"
		FROM post_images
		WHERE post_id = $1
		ORDER BY "order" ASC
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

func (r *PostRepository) GetComments(postID string) ([]domain.PostComment, error) {
	rows, err := r.DB.Query(`
		SELECT id, post_id, user_id, content, created_at
		FROM post_comments
		WHERE post_id = $1
		ORDER BY created_at DESC
	`, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []domain.PostComment
	for rows.Next() {
		var c domain.PostComment
		rows.Scan(&c.ID, &c.PostID, &c.UserID, &c.Content, &c.CreatedAt)
		comments = append(comments, c)
	}
	return comments, nil
}


// ---------------- SHARES ----------------

func (r *PostRepository) Share(postID, userID string) error {
	_, err := r.DB.Exec(`
		INSERT INTO post_shares (id, post_id, user_id, created_at)
		VALUES (gen_random_uuid(), $1, $2, NOW())
	`, postID, userID)
	return err
}
