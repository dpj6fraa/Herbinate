package repository

import (
	"database/sql"
	"errors"
	"fmt"

	"myapp/internal/domain"
)

type UserRepository struct {
	DB *sql.DB
}

func (r *UserRepository) Create(user *domain.User) error {
	_, err := r.DB.Exec(
		`INSERT INTO users (id, email, password_hash, username, isverify)
		 VALUES ($1, $2, $3, $4, $5)`,
		user.ID,
		user.Email,
		user.PasswordHash,
		user.Username,
		user.IsVerified,
	)

	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}

func (r *UserRepository) FindByEmail(email string) (*domain.User, error) {
	row := r.DB.QueryRow(
		`SELECT id, email, password_hash, username, isverify, created_at
		 FROM users
		 WHERE email = $1`,
		email,
	)

	var u domain.User
	err := row.Scan(
		&u.ID,
		&u.Email,
		&u.PasswordHash,
		&u.Username,
		&u.IsVerified,
		&u.CreatedAt,
	)

	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &u, nil
}

func (r *UserRepository) FindByID(id string) (*domain.User, error) {
	row := r.DB.QueryRow(
		`SELECT id, email, password_hash, username, isverify, created_at
		 FROM users
		 WHERE id = $1`,
		id,
	)

	var u domain.User
	err := row.Scan(
		&u.ID,
		&u.Email,
		&u.PasswordHash,
		&u.Username,
		&u.IsVerified,
		&u.CreatedAt,
	)

	if errors.Is(err, sql.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	return &u, nil
}

func (r *UserRepository) MarkVerifiedByEmail(email string) error {
	_, err := r.DB.Exec(
		`UPDATE users SET isverify = true WHERE email = $1`,
		email,
	)
	return err
}
