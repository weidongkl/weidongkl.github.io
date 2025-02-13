#!/bin/bash

# 定义 start 方法
start() {
    echo "Starting the application..."
    npm run start
}

# 定义 deploy 方法
deploy() {
    echo "Deploying the application..."
    npm rum build
}

# 定义release 方法
release() {
    echo "Releasing the application..."
    npm run docusaurus docs:version 1.0
}

# 检查参数并执行对应的方法
case "$1" in
    start)
        start
        ;;
    deploy)
        deploy
        ;;
    *)
        echo "Usage: $0 {start|deploy}"
        exit 1
        ;;
esac
