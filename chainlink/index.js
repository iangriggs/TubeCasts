const { Requester, Validator } = require("@chainlink/external-adapter");
const youtubedl = require("youtube-dl-exec");
const Web3Storage = require("web3.storage").Web3Storage;
const File = require("web3.storage").File;
const fs = require("fs");

require("dotenv").config();

// Define custom error scenarios for the API.
// Return true for the adapter to retry.
const customError = (data) => {
  if (data.Response === "Error") return true;
  return false;
};

// Define custom parameters to be used by the adapter.
// Extra parameters can be stated in the extra object,
// with a Boolean value indicating whether or not they
// should be required.
const customParams = {
  youtube_url: ["youtube_url"],
  request_id: ["request_id"],
};

const saveToIPFS = async (outputDir, id) => {
  const client = new Web3Storage({ token: process.env.WEB3STORAGE_API_KEY });
  const file = new File(
    [fs.readFileSync(`${outputDir}/${id}.mp3`)],
    `${id}.mp3`,
    {
      type: "audio/mp3",
    }
  );
  const cid = await client.put([file], { wrapWithDirectory: false });
  return cid;
};

const intFromBytes = (bytes) =>
  bytes.reduce((a, c, i) => a + c * 2 ** (56 - i * 8), 0);

const createRequest = async (input, callback) => {
  const validator = new Validator(input, customParams);
  const jobRunId = validator.validated.id;
  const youtubeUrl = validator.validated.data.youtube_url;
  const requestId = intFromBytes(validator.validated.data.request_id);
  console.log(`requestId:${requestId}`);
  const outputDir = "output";
  try {
    const output = await youtubedl(youtubeUrl, {
      extractAudio: true,
      audioFormat: "mp3",
      rmCacheDir: true,
      noCacheDir: true,
      writeInfoJson: true,
      output: `${outputDir}/${requestId}.%(ext)s`,
    });

    console.log(output);
    const cid = await saveToIPFS(outputDir, requestId);
    console.log(cid);

    const infoJson = JSON.parse(
      fs.readFileSync(`${outputDir}/${requestId}.info.json`)
    );

    fs.unlinkSync(`${outputDir}/${requestId}.info.json`);
    fs.unlinkSync(`${outputDir}/${requestId}.mp3`);

    callback(200, {
      title: infoJson.title,
      cid: cid,
      thumbnail: infoJson.thumbnail,
      upload_date: infoJson.upload_date,
      duration: infoJson.duration,
      youtube_url: infoJson.webpage_url,
    });
  } catch (err) {
    callback(500, { id: jobRunId, err });
  }
};

// This is a wrapper to allow the function to work with
// GCP Functions
exports.gcpservice = (req, res) => {
  createRequest(req.body, (statusCode, data) => {
    res.status(statusCode).send(data);
  });
};

// This is a wrapper to allow the function to work with
// AWS Lambda
exports.handler = (event, context, callback) => {
  createRequest(event, (statusCode, data) => {
    callback(null, data);
  });
};

// This is a wrapper to allow the function to work with
// newer AWS Lambda implementations
exports.handlerv2 = (event, context, callback) => {
  createRequest(JSON.parse(event.body), (statusCode, data) => {
    callback(null, {
      statusCode: statusCode,
      body: JSON.stringify(data),
      isBase64Encoded: false,
    });
  });
};

// This allows the function to be exported for testing
// or for running in express
module.exports.createRequest = createRequest;
