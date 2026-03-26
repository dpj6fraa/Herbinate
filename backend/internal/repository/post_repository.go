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
			"user_id":    1,
			"title":      1,
			"content":    1,
			"created_at": 1,
			"username":   "$user.username",
			"profileImg": "$user.profile_image_url",
			"likes":      bson.M{"$size": bson.M{"$ifNull": bson.A{"$likes", bson.A{}}}},
			"comments":   bson.M{"$size": "$comments"},
			"shares":     bson.M{"$size": bson.M{"$ifNull": bson.A{"$shares", bson.A{}}}},
			// 🌟 เนื่องจากยังไม่ล็อกอิน ก็คือยังไม่ได้บุ๊กมาร์ก
			"is_bookmarked": false,
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
		// 🌟 1. เพิ่ม Lookup เพื่อเช็คว่า User คนนี้ได้ Bookmark โพสต์นี้ไว้ไหม
		{{Key: "$lookup", Value: bson.M{
			"from": "post_bookmarks",
			"let":  bson.M{"postId": "$_id"},
			"pipeline": bson.A{
				bson.M{"$match": bson.M{"$expr": bson.M{"$and": bson.A{
					bson.M{"$eq": bson.A{"$post_id", "$$postId"}},
					bson.M{"$eq": bson.A{"$user_id", userID}},
					bson.M{"$eq": bson.A{"$status", true}},
				}}}},
			},
			"as": "bookmark_info",
		}}},
		{{Key: "$project", Value: bson.M{
			"id":         "$_id",
			"user_id":    1, // อย่าลืมส่ง user_id กลับไปด้วย เผื่อหน้าบ้านต้องใช้
			"title":      1,
			"content":    1,
			"created_at": 1,
			"username":   "$user.username",
			"profileImg": "$user.profile_image_url",
			"likes":      bson.M{"$size": bson.M{"$ifNull": bson.A{"$likes", bson.A{}}}},
			"comments":   bson.M{"$size": "$comments"},
			"shares":     bson.M{"$size": bson.M{"$ifNull": bson.A{"$shares", bson.A{}}}},
			"liked":      bson.M{"$in": bson.A{userID, bson.M{"$ifNull": bson.A{"$likes", bson.A{}}}}},
			// 🌟 2. ส่งค่า is_bookmarked กลับไป (ถ้า array มีค่าแปลว่า true)
			"is_bookmarked": bson.M{"$gt": bson.A{bson.M{"$size": "$bookmark_info"}, 0}},
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
		// 🌟 1. เพิ่ม Lookup Bookmark
		{{Key: "$lookup", Value: bson.M{
			"from": "post_bookmarks",
			"let":  bson.M{"postId": "$_id"},
			"pipeline": bson.A{
				bson.M{"$match": bson.M{"$expr": bson.M{"$and": bson.A{
					bson.M{"$eq": bson.A{"$post_id", "$$postId"}},
					bson.M{"$eq": bson.A{"$user_id", userID}},
					bson.M{"$eq": bson.A{"$status", true}},
				}}}},
			},
			"as": "bookmark_info",
		}}},
		{{Key: "$project", Value: bson.M{
			"id":         "$_id",
			"user_id":    1,
			"title":      1,
			"content":    1,
			"created_at": 1,
			"username":   "$user.username",
			"profileImg": "$user.profile_image_url",
			"likes":      bson.M{"$size": bson.M{"$ifNull": bson.A{"$likes", bson.A{}}}},
			"comments":   bson.M{"$size": "$comments"},
			"shares":     bson.M{"$size": bson.M{"$ifNull": bson.A{"$shares", bson.A{}}}},
			"liked": bson.M{
				"$in": bson.A{userID, bson.M{"$ifNull": bson.A{"$likes", bson.A{}}}},
			},
			// 🌟 2. ส่งค่า is_bookmarked กลับไป
			"is_bookmarked": bson.M{"$gt": bson.A{bson.M{"$size": "$bookmark_info"}, 0}},
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

func (r *PostRepository) DeleteComment(commentID, userID primitive.ObjectID) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// ลบโดยเช็คทั้ง ID คอมเมนต์ และต้องเป็นของ User ที่สั่งลบเท่านั้น
	result, err := r.CommentCollection.DeleteOne(ctx, bson.M{"_id": commentID, "user_id": userID})
	if err != nil {
		return err
	}

	// ถ้า DeletedCount เป็น 0 แปลว่าไม่พบคอมเมนต์ หรือไม่ใช่เจ้าของ
	if result.DeletedCount == 0 {
		return errors.New("comment not found or unauthorized")
	}

	return nil
}

// อัปเดตโพสต์
// อัปเดตโพสต์
func (r *PostRepository) UpdatePost(postID, userID primitive.ObjectID, title, content string, images []models.PostImage) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// กันเหนียว กรณีไม่มีรูปภาพเลย
	if images == nil {
		images = []models.PostImage{}
	}

	update := bson.M{
		"$set": bson.M{
			"title":      title,
			"content":    content,
			"images":     images, // อัปเดต array รูปภาพใหม่ทับของเก่า
			"updated_at": time.Now(),
		},
	}

	// ต้องเช็คทั้ง _id และ user_id เพื่อความปลอดภัย
	result, err := r.PostCollection.UpdateOne(ctx, bson.M{"_id": postID, "user_id": userID}, update)
	if err != nil {
		return err
	}
	if result.MatchedCount == 0 {
		return errors.New("post not found or unauthorized")
	}
	return nil
}

// ดึงโพสต์ทั้งหมดที่ User คนนี้ได้ Bookmark ไว้
func (r *PostRepository) GetBookmarkedPosts(userID primitive.ObjectID) ([]bson.M, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	bookmarkColl := database.GetCollection("post_bookmarks")

	pipeline := mongo.Pipeline{
		// 1. หา Bookmark ของ User นี้ที่ status = true
		{{Key: "$match", Value: bson.M{"user_id": userID, "status": true}}},
		// 2. Lookup ไปหา Post
		{{Key: "$lookup", Value: bson.M{
			"from":         "posts",
			"localField":   "post_id",
			"foreignField": "_id",
			"as":           "post",
		}}},
		{{Key: "$unwind", Value: "$post"}},
		// 3. Lookup user ที่โพสต์
		{{Key: "$lookup", Value: bson.M{
			"from":         "users",
			"localField":   "post.user_id",
			"foreignField": "_id",
			"as":           "post_user",
		}}},
		{{Key: "$unwind", Value: bson.M{"path": "$post_user", "preserveNullAndEmptyArrays": true}}},
		// 4. Lookup comments
		{{Key: "$lookup", Value: bson.M{
			"from":         "post_comments",
			"localField":   "post._id",
			"foreignField": "post_id",
			"as":           "comments",
		}}},
		// 5. Project ข้อมูลให้เหมือนหน้า Feed
		{{Key: "$project", Value: bson.M{
			"id":            "$post._id",
			"user_id":       "$post.user_id",
			"title":         "$post.title",
			"content":       "$post.content",
			"created_at":    bson.M{"$ifNull": bson.A{"$post.created_at", "$post.createdAt"}},
			"username":      "$post_user.username",
			"profileImg":    "$post_user.profile_image_url",
			"likes":         bson.M{"$size": bson.M{"$ifNull": bson.A{"$post.likes", bson.A{}}}},
			"comments":      bson.M{"$size": "$comments"},
			"shares":        bson.M{"$size": bson.M{"$ifNull": bson.A{"$post.shares", bson.A{}}}},
			"liked":         bson.M{"$in": bson.A{userID, bson.M{"$ifNull": bson.A{"$post.likes", bson.A{}}}}},
			"is_bookmarked": true,
		}}},
		{{Key: "$sort", Value: bson.M{"created_at": -1}}},
	}

	cursor, err := bookmarkColl.Aggregate(ctx, pipeline)
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

// ดึงประวัติคอมเมนต์ทั้งหมดของ User นี้ พร้อมแนบชื่อโพสต์ต้นทางมาด้วย
func (r *PostRepository) GetUserComments(userID primitive.ObjectID) ([]bson.M, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	pipeline := mongo.Pipeline{
		// 1. หาคอมเมนต์ทั้งหมดของ User นี้
		{{Key: "$match", Value: bson.M{"user_id": userID}}},
		// 2. ดึงข้อมูล Post ต้นทางมาเพื่อเอา Title
		{{Key: "$lookup", Value: bson.M{
			"from":         "posts",
			"localField":   "post_id",
			"foreignField": "_id",
			"as":           "post",
		}}},
		{{Key: "$unwind", Value: bson.M{"path": "$post", "preserveNullAndEmptyArrays": true}}},
		// 3. Project ข้อมูลส่งกลับไปหน้าบ้าน
		{{Key: "$project", Value: bson.M{
			"id":         "$_id",
			"post_id":    1,
			"content":    1,
			"created_at": bson.M{"$ifNull": bson.A{"$created_at", "$createdAt"}},
			"post_title": "$post.title", // ดึงชื่อโพสต์มาโชว์ให้รู้ว่าเม้นต์ที่ไหน
		}}},
		{{Key: "$sort", Value: bson.M{"created_at": -1}}}, // เรียงจากล่าสุดไปเก่าสุด
	}

	cursor, err := r.CommentCollection.Aggregate(ctx, pipeline)
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
