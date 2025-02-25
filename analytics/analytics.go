// Copyright 2022-2023 The Memphis.dev Authors
// Licensed under the Memphis Business Source License 1.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// Changed License: [Apache License, Version 2.0 (https://www.apache.org/licenses/LICENSE-2.0), as published by the Apache Foundation.
//
// https://github.com/memphisdev/memphis-broker/blob/master/LICENSE
//
// Additional Use Grant: You may make use of the Licensed Work (i) only as part of your own product or service, provided it is not a message broker or a message queue product or service; and (ii) provided that you do not use, provide, distribute, or make available the Licensed Work as a Service.
// A "Service" is a commercial offering, product, hosted, or managed service, that allows third parties (other than your own employees and contractors acting on your behalf) to access and/or use the Licensed Work or a substantial set of the features or functionality of the Licensed Work to third parties as a software-as-a-service, platform-as-a-service, infrastructure-as-a-service or other similar services that compete with Licensor products or services.
package analytics

import (
	"context"
	"memphis-broker/conf"
	"memphis-broker/db"
	"memphis-broker/models"

	"github.com/posthog/posthog-go"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type EventParam struct {
	Name  string `json:"name"`
	Value string `json:"value" binding:"required"`
}

var configuration = conf.GetConfig()
var systemKeysCollection *mongo.Collection
var deploymentId string
var analyticsFlag string
var AnalyticsClient posthog.Client

func InitializeAnalytics(c *mongo.Client) error {
	systemKeysCollection = db.GetCollection("system_keys", c)
	deployment, err := getSystemKey("deployment_id")
	if err == mongo.ErrNoDocuments {
		deploymentId = primitive.NewObjectID().Hex()
		deploymentKey := models.SystemKey{
			ID:    primitive.NewObjectID(),
			Key:   "deployment_id",
			Value: deploymentId,
		}

		_, err = systemKeysCollection.InsertOne(context.TODO(), deploymentKey)
		if err != nil {
			return err
		}
	} else if err != nil {
		return err
	} else {
		deploymentId = deployment.Value
	}

	analytics, err := getSystemKey("analytics")
	if err == mongo.ErrNoDocuments {
		var analyticsKey models.SystemKey
		if configuration.ANALYTICS == "true" {
			analyticsKey = models.SystemKey{
				ID:    primitive.NewObjectID(),
				Key:   "analytics",
				Value: "true",
			}
		} else {
			analyticsKey = models.SystemKey{
				ID:    primitive.NewObjectID(),
				Key:   "analytics",
				Value: "false",
			}
		}

		_, err = systemKeysCollection.InsertOne(context.TODO(), analyticsKey)
		if err != nil {
			return err
		}
		analyticsFlag = configuration.ANALYTICS
	} else if err != nil {
		return err
	} else {
		analyticsFlag = analytics.Value
	}

	client, err := posthog.NewWithConfig(configuration.ANALYTICS_TOKEN, posthog.Config{Endpoint: "https://app.posthog.com"})
	if err != nil {
		return err
	}

	AnalyticsClient = client
	return nil
}

func getSystemKey(key string) (models.SystemKey, error) {
	filter := bson.M{"key": key}
	var systemKey models.SystemKey
	err := systemKeysCollection.FindOne(context.TODO(), filter).Decode(&systemKey)
	if err != nil {
		return systemKey, err
	}
	return systemKey, nil
}

func Close() {
	analytics, _ := getSystemKey("analytics")
	if analytics.Value == "true" {
		AnalyticsClient.Close()
	}
}

func SendEvent(userId, eventName string) {
	var distinctId string
	if configuration.DEV_ENV != "" {
		distinctId = "dev"
	} else if configuration.SANDBOX_ENV == "true" {
		distinctId = "sandbox" + "-" + userId
	} else {
		distinctId = deploymentId + "-" + userId
	}

	p := posthog.NewProperties()
	p.Set("memphis-version", configuration.MEMPHIS_VERSION)

	go AnalyticsClient.Enqueue(posthog.Capture{
		DistinctId: distinctId,
		Event:      eventName,
		Properties: p,
	})
}

func SendEventWithParams(userId string, params []EventParam, eventName string) {
	var distinctId string
	if configuration.DEV_ENV != "" {
		distinctId = "dev"
	} else if configuration.SANDBOX_ENV == "true" {
		distinctId = "sandbox" + "-" + userId
	} else {
		distinctId = deploymentId + "-" + userId
	}

	p := posthog.NewProperties()
	for _, param := range params {
		p.Set(param.Name, param.Value)
	}
	p.Set("memphis-version", configuration.MEMPHIS_VERSION)

	go AnalyticsClient.Enqueue(posthog.Capture{
		DistinctId: distinctId,
		Event:      eventName,
		Properties: p,
	})
}

func SendErrEvent(origin, errMsg string) {
	distinctId := deploymentId
	if configuration.DEV_ENV != "" {
		distinctId = "dev"
	} else if configuration.SANDBOX_ENV == "true" {
		distinctId = "sandbox"
	}

	p := posthog.NewProperties()
	p.Set("err_log", errMsg)
	p.Set("err_source", origin)
	p.Set("memphis-version", configuration.MEMPHIS_VERSION)
	AnalyticsClient.Enqueue(posthog.Capture{
		DistinctId: distinctId,
		Event:      "error",
		Properties: p,
	})
}
