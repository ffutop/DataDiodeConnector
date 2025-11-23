#!/bin/bash
set -e

ARCH=${1:-amd64}

if [ "$ARCH" = "amd64" ]; then
    RUST_TARGET="x86_64-unknown-linux-musl"
elif [ "$ARCH" = "arm64" ]; then
    RUST_TARGET="aarch64-unknown-linux-musl"
else
    echo "Unsupported architecture: $ARCH"
    exit 1
fi

if [ "${SKIP_RUST_BUILD}" = "true" ]; then  
    echo ">>> SKIP_RUST_BUILD is set to true. Using pre-built binaries..."  
else  
    BUILDER=${RUST_BUILDER:-cargo}  
    echo ">>> Building with $BUILDER for target $RUST_TARGET..."  
    $BUILDER build --target ${RUST_TARGET} --release  
fi  

./create_images.sh $ARCH

tar -czvf osdd_ingress-${ARCH}.tar.gz osdd.service ../target/${RUST_TARGET}/release/osdd ../settings/ingress/Config.toml dockers/ph_kafka_ingress.tar dockers/transport_udp_send.tar  dockers/ph_mock_ingress.tar dockers/ph_udp_ingress.tar dockers/filter.tar
tar -czvf osdd_egress-${ARCH}.tar.gz osdd.service ../target/${RUST_TARGET}/release/osdd ../settings/egress/Config.toml dockers/ph_kafka_egress.tar  dockers/transport_udp_receive.tar dockers/ph_mock_egress.tar dockers/ph_udp_egress.tar dockers/filter.tar
