package main

import (
	"context"
	"fmt"
	"os"

	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
)

var redis_url = os.Getenv("REDIS_URL")
var conn = redis.NewClient(&redis.Options{
	Addr:     redis_url,
	Password: os.Getenv("REDIS_PASSWORD"), // no password set
	DB:       0,                           // use default DB
})

func InitRedis() { godotenv.Load() }

func RdxSet(key, value string) error {

	ctx := context.Background()

	_, err := conn.Set(ctx, key, value, 0).Result()
	if err != nil {
		return fmt.Errorf("error while doing SET command in redis : %v", err)
	}

	return err

}

func RdxGet(key string) (string, error) {

	ctx := context.Background()

	value, err := conn.Get(ctx, key).Result()
	if err != nil {
		return "", fmt.Errorf("error while doing GET command in redis : %v", err)
	}

	return value, err
}

func RdxDel(key string) (string, error) {

	ctx := context.Background()

	value, err := conn.Del(ctx, key).Result()
	if err != nil {
		return "", fmt.Errorf("error while doing DEL command in redis : %v", err)
	}

	return "" + string(value), err
}

func RdxHset(hash, key, value string) error {

	ctx := context.Background()

	_, err := conn.HSet(ctx, hash, key, value).Result()
	if err != nil {
		return fmt.Errorf("error while doing HSET command in redis : %v", err)
	}

	return err
}

func RdxHget(hash, key string) (string, error) {

	ctx := context.Background()

	value, err := conn.HGet(ctx, hash, key).Result()
	if err != nil {
		return "error : ", err
	}

	return value, err

}

func RdxHdel(hash, key string) (string, error) {

	ctx := context.Background()

	value, err := conn.HDel(ctx, hash, key).Result()
	if err != nil {
		return string(value), fmt.Errorf("error while doing HGET command in redis : %v", err)
	}

	return string(value), err

}

func RdxHgetall(hash string) map[string]string {

	ctx := context.Background()
	value, _ := conn.HGetAll(ctx, hash).Result()

	return value

}

func RdxAppend(key, value string) error {
	ctx := context.Background()
	_, err := conn.Append(ctx, key, value).Result()
	if err != nil {
		return fmt.Errorf("error while doing APPEND command in redis : %v", err)
	}
	return err
}
