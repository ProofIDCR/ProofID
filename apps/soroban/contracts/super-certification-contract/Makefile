all: build

build:
	cargo build --target wasm32-unknown-unknown --release
	@ls -l target/wasm32-unknown-unknown/release/*.wasm

optimize:
	soroban contract optimize --wasm target/wasm32-unknown-unknown/release/super_certification_contract.wasm

test:
	cargo test

check:
	cargo check

clippy:
	cargo clippy --all-targets -- -D warnings

fmt:
	cargo fmt --all -- --check

clean:
	cargo clean

install-deps:
	rustup target add wasm32-unknown-unknown
	cargo install --locked soroban-cli

deploy-testnet: build optimize
	soroban contract deploy \
		--wasm target/wasm32-unknown-unknown/release/super_certification_contract.optimized.wasm \
		--source <SOURCE_ACCOUNT> \
		--rpc-url https://soroban-testnet.stellar.org \
		--network-passphrase "Test SDF Network ; September 2015"

deploy-mainnet: build optimize
	@echo "WARNING: You are about to deploy to MAINNET."
	@read -p "Are you sure you want to continue? (y/n) " answer; \
	if [ "$$answer" != "y" ]; then \
		echo "Deployment aborted."; \
		exit 1; \
	fi
	soroban contract deploy \
		--wasm target/wasm32-unknown-unknown/release/super_certification_contract.optimized.wasm \
		--source <SOURCE_ACCOUNT> \
		--rpc-url https://soroban-mainnet.stellar.org \
		--network-passphrase "Public Global Stellar Network ; September 2015"

.PHONY: all build optimize test check clippy fmt clean install-deps deploy-testnet deploy-mainnet
