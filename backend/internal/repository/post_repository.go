package repository

import (
	"context"
	"errors"
	"time"

	"herb-api/internal/database"
	"herb-api/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type PostRepository struct {
	PostCollection    *mongo.Collection
	CommentCollection *mongo.Collection
	UserCollection    *mongo.Collection
}

func NewPostRepository() *PostRepository {
	return &PostRepository{
		PostCollection:    database.GetCollection("posts"),
		CommentCollection: database.GetCollection("post_comments"),
		UserCollection:    database.GetCollection("users"),
	}
}

func (r *PostRepository) Create(post *models.Post) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	post.CreatedAt = time.Now()
	post.UpdatedAt = time.Now()
	if post.Images == nil {
		post.Images = []models.PostImage{}
	}
	if post.Likes == nil {
		post.Likes = []primitive.ObjectID{}
	}
	if post.Shares == nil {
		post.Shares = []primitive.ObjectID{}
	}

	result, err := r.PostCollection.InsertOne(ctx, post)
	if err == nil {
		post.ID = result.InsertedID.(primitive.ObjectID)
	}
	return err
}

func (r *PostRepository) AddImage(postID primitive.ObjectID, img *models.PostImage) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	img.ID = primitive.NewObjectID()

	_, err := r.PostCollection.UpdateOne(
		ctx,
		bson.M{"_id": postID},
		bson.M{"$push": bson.M{"images": img}},
	)
	return err
}

func (r *PostRepository) GetFeed() ([]bson.M, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{Key: "$lookup", Value: bson.M{
			"from":         "users",
			"localField":   "user_id",
			"foreignField": "_id",
			"as":           "user",
		}}},
		{{Key: "$unwind", Value: "$user"}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "post_comments",
			"localField":   "_id",
			"foreignField": "post_id",
			"as":           "comments",
		}}},
		{{Key: "$project", Value: bson.M{
			"id":         "$_id",
			"title":      1,
			"content":    1,
			"created_at": 1,
			"username":   "$user.username",
			// เพิ่มบรรทัดนี้ลงไป (เปลี่ยน $user.profileImg ตามชื่อ field จริงใน DB ของคุณ)
			"profileImg": "$user.profile_image_url",
			"likes":      bson.M{"$size": bson.M{"$ifNull": bson.A{"$likes", bson.A{}}}},
			"comments":   bson.M{"$size": "$comments"},
			"shares":     bson.M{"$size": bson.M{"$ifNull": bson.A{"$shares", bson.A{}}}},
		}}},
		{{Key: "$sort", Value: bson.M{"created_at": -1}}},
	}

	cursor, err := r.PostCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	results := []bson.M{}
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}
	return results, nil
}

func (r *PostRepository) GetFeedWithUser(userID primitive.ObjectID) ([]bson.M, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{Key: "$lookup", Value: bson.M{
			"from":         "users",
			"localField":   "user_id",
			"foreignField": "_id",
			"as":           "user",
		}}},
		{{Key: "$unwind", Value: "$user"}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "post_comments",
			"localField":   "_id",
			"foreignField": "post_id",
			"as":           "comments",
		}}},
		{{Key: "$project", Value: bson.M{
			"id":         "$_id",
			"title":      1,
			"content":    1,
			"created_at": 1,
			"username":   "$user.username",
			// เพิ่มบรรทัดนี้ลงไปเช่นกัน
			"profileImg": "$user.profile_image_url",
			"likes":      bson.M{"$size": bson.M{"$ifNull": bson.A{"$likes", bson.A{}}}},
			"comments":   bson.M{"$size": "$comments"},
			"shares":     bson.M{"$size": bson.M{"$ifNull": bson.A{"$shares", bson.A{}}}},
			"liked":      bson.M{"$in": bson.A{userID, bson.M{"$ifNull": bson.A{"$likes", bson.A{}}}}},
		}}},
		{{Key: "$sort", Value: bson.M{"created_at": -1}}},
	}

	cursor, err := r.PostCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	results := []bson.M{}
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}
	return results, nil
}

// ---------------- IMAGES ----------------

func (r *PostRepository) GetImages(postID primitive.ObjectID) ([]models.PostImage, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var post models.Post
	err := r.PostCollection.FindOne(ctx, bson.M{"_id": postID}, options.FindOne().SetProjection(bson.M{"images": 1})).Decode(&post)
	if err != nil {
		return nil, err
	}

	return post.Images, nil
}

func (r *PostRepository) DeletePost(postID, userID primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := r.PostCollection.DeleteOne(ctx, bson.M{"_id": postID, "user_id": userID})
	if err != nil {
		return err
	}
	if result.DeletedCount == 0 {
		return errors.New("post not found or unauthorized")
	}

	// Delete associated comments
	_, _ = r.CommentCollection.DeleteMany(ctx, bson.M{"post_id": postID})

	return nil
}

// ---------------- LIKES ----------------

func (r *PostRepository) Like(postID, userID primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := r.PostCollection.UpdateOne(
		ctx,
		bson.M{"_id": postID},
		bson.M{"$addToSet": bson.M{"likes": userID}},
	)
	return err
}

func (r *PostRepository) Unlike(postID, userID primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err := r.PostCollection.UpdateOne(
		ctx,
		bson.M{"_id": postID},
		bson.M{"$pull": bson.M{"likes": userID}},
	)
	return err
}

// ---------------- COMMENTS ----------------

func (r *PostRepository) AddComment(c *models.PostComment) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	c.CreatedAt = time.Now()
	result, err := r.CommentCollection.InsertOne(ctx, c)
	if err == nil {
		c.ID = result.InsertedID.(primitive.ObjectID)
	}
	return err
}

func (r *PostRepository) GetComments(postID primitive.ObjectID) ([]models.CommentWithUser, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"post_id": postID}}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "users",
			"localField":   "user_id",
			"foreignField": "_id",
			"as":           "user",
		}}},
		{{Key: "$unwind", Value: "$user"}},
		{{Key: "$project", Value: bson.M{
			"id":                "$_id",
			"user_id":           1,
			"username":          "$user.username",
			"profile_image_url": "$user.profile_image_url",
			"content":           1,
			"created_at":        1,
		}}},
		{{Key: "$sort", Value: bson.M{"created_at": -1}}},
	}

	cursor, err := r.CommentCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	comments := []models.CommentWithUser{}
	if err = cursor.All(ctx, &comments); err != nil {
		return nil, err
	}
	return comments, nil
}

// ---------------- SHARES ----------------

func (r *PostRepository) Share(postID, userID primitive.ObjectID) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := r.PostCollection.UpdateOne(
		ctx,
		bson.M{"_id": postID},
		bson.M{"$addToSet": bson.M{"shares": userID}},
	)

	if err != nil {
		return false, err
	}

	return result.ModifiedCount > 0, nil
}

func (r *PostRepository) GetPostDetail(postID, userID primitive.ObjectID) (map[string]interface{}, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"_id": postID}}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "users",
			"localField":   "user_id",
			"foreignField": "_id",
			"as":           "user",
		}}},
		{{Key: "$unwind", Value: "$user"}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "post_comments",
			"localField":   "_id",
			"foreignField": "post_id",
			"as":           "comments",
		}}},
		{{Key: "$project", Value: bson.M{
			"id":         "$_id",
			"title":      1,
			"content":    1,
			"created_at": 1,
			"username":   "$user.username",
			"profileImg": "$user.profile_image_url",

			"likes":    bson.M{"$size": bson.M{"$ifNull": bson.A{"$likes", bson.A{}}}},
			"comments": bson.M{"$size": "$comments"},
			"shares":   bson.M{"$size": bson.M{"$ifNull": bson.A{"$shares", bson.A{}}}},

			// ✅ เพิ่มตรงนี้
			"liked": bson.M{
				"$in": bson.A{userID, bson.M{"$ifNull": bson.A{"$likes", bson.A{}}}},
			},
		}}},
	}

	cursor, err := r.PostCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	results := []bson.M{}
	if err = cursor.All(ctx, &results); err != nil {
		return nil, err
	}

	if len(results) == 0 {
		return nil, errors.New("post not found")
	}

	return results[0], nil
}

func (r *PostRepository) GetCommentWithUser(commentID primitive.ObjectID) (models.CommentWithUser, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		{{Key: "$match", Value: bson.M{"_id": commentID}}},
		{{Key: "$lookup", Value: bson.M{
			"from":         "users",
			"localField":   "user_id",
			"foreignField": "_id",
			"as":           "user",
		}}},
		{{Key: "$unwind", Value: "$user"}},
		{{Key: "$project", Value: bson.M{
			"id":                "$_id",
			"user_id":           1,
			"username":          "$user.username",
			"profile_image_url": "$user.profile_image_url",
			"content":           1,
			"created_at":        1,
		}}},
	}

	cursor, err := r.CommentCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return models.CommentWithUser{}, err
	}
	defer cursor.Close(ctx)

	results := []models.CommentWithUser{}
	if err = cursor.All(ctx, &results); err != nil {
		return models.CommentWithUser{}, err
	}

	if len(results) == 0 {
		return models.CommentWithUser{}, errors.New("comment not found")
	}

	return results[0], nil
}
