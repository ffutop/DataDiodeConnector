#!/bin/bash
#Create docker image for input file.
#Target is a build with libc
#Save docker image as tar

ARCH=${2:-amd64}

if [ "$ARCH" = "amd64" ]; then
    RUST_TARGET="x86_64-unknown-linux-musl"
elif [ "$ARCH" = "arm64" ]; then
    RUST_TARGET="aarch64-unknown-linux-musl"
else
    echo "Unsupported architecture: $ARCH"
    exit 1
fi

echo $1
docker image rm $1
cp ../target/${RUST_TARGET}/release/$1 .
docker build -t $1 . --build-arg file=$1
rm $1
mkdir -p dockers
docker save $1 > dockers/$1.tar