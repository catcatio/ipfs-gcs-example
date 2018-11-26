# ipfs-gcs-example

An example of IPFS backed by Google Cloud Storage

express.js, ipfs, gcs, openpgp

## Run

Create a `.env` file, see `.env.sample`

```env
NODE_ENV=development

GOOGLE_APPLICATION_CREDENTIALS=serviceAccountKey.json

BUCKET_NAME=ipfs-example
IPFS_REPO_LOCK_NAME=ipfs-example-20181112
IPFS_REPO_PATH=/

PORT=3000
FILE_KEY=<system wide filekey>

```

### Run with container

```bash
docker-compose up
```

### Run locally

```bash
npm i
npm run dev
```

## API

### upload

```bash
curl -F "upload=/path/to/file" -X "POST" -i http://localhost:3000/upload
```

### download

```bash
curl http://localhost:3000/download/ipfs/QmdSEXaUoCAtvFLDZ1DNAjmHJjvXmnHeYFK7R5CWuEu8ZB
```

### upload with encryption

```bash
# with default file key
curl -F "upload=/path/to/file" -X "POST" -i http://localhost:3000/s-upload

# with custom file key
curl -F "upload=/path/to/file" -X "POST" -i http://localhost:3000/s-upload?fileKey=2609a2251e2a1a934a99539ba54d6e55
```

### download with encryption

```bash
# with default file key
curl http://localhost:3000/s-download/ipfs/QmX44ww41WYnzApw6rGvgGXwZdM1xnh4wPv7AHtQYqWdK1

# with custom file key
curl http://localhost:3000/s-download/ipfs/QmX44ww41WYnzApw6rGvgGXwZdM1xnh4wPv7AHtQYqWdK1?fileKey=2609a2251e2a1a934a99539ba54d6e55
```