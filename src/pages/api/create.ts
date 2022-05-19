import type { NextApiRequest, NextApiResponse } from 'next'
require('dotenv').config()
const path = require('path')
const { Readable } = require("stream")
const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK(process.env.PINATA_KEY, process.env.PINATA_SECRET);
const { registerFont, createCanvas, loadImage } = require('canvas')
registerFont(path.join(process.cwd(), '/public/SpaceGrotesk-Regular.ttf'), { family: 'San Serif' })

type Data = {
  result: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {

  if (req.method !== 'POST') {
    res.status(400).json({ result: 'Bad request' })
    return
  }

  try {

    const canvas = createCanvas(350, 350)
    const ctx = canvas.getContext('2d')

    if (req.body.template == 'white') {
      loadImage(path.join(process.cwd(),'/public/binco.jpg')).then((image) => {
        ctx.drawImage(image, 0, 0)
        ctx.textAlign = "center";
        ctx.font = '15px Space Grotesk'
        ctx.fillStyle = "#bf0022"
        ctx.fillText(req.body.name, 175, 228)
      })
    }
    else {
      loadImage(path.join(process.cwd(),'/public/nero.jpg')).then((image) => {
        ctx.drawImage(image, 0, 0)
        ctx.textAlign = "center";
        ctx.font = '15px Space Grotesk'
        ctx.fillStyle = "#bc0020";
        ctx.fillText(req.body.name, 175, 228)
        console.log(canvas.toDataURL())
      })
    }

    const stream = canvas.createJPEGStream()
    stream.path = "pinata_issue.png" //read more here https://github.com/PinataCloud/Pinata-SDK/issues/28#issuecomment-816439078
    const options_image = {
      pinataMetadata: {
        name: req.body.name+'_image'
      },
      pinataOptions: {
        cidVersion: 0
      }
    };
    const res_image = await pinata.pinFileToIPFS(stream, options_image)
    const cid = res_image.IpfsHash
    const url_image = "https://ipfs.io/ipfs/" + cid
    const metadata = {
      "description": "333.Builders is a community of talents, professionals, investors and enthusiasts of the Blockchain and Web3 ecosystem. We aim to become first investment DAO founded by Italian minds.",
      "external_url": "333builders.com",
      "image": url_image,
      "name": "NFT for beginners",
      "attributes": [
        {
          "trait_type": "Course",
          "value": "#1NFTforbeginners"
        },
        {
          "trait_type": "Year",
          "value": "2022"
        }
      ]
    }
    const options_metadata = {
      pinataMetadata: {
        name: req.body.name+'_metadata'
      },
      pinataOptions: {
        cidVersion: 0
      }
    };
    var stream_metadata = Readable.from(JSON.stringify(metadata), { encoding: 'utf8' })
    stream_metadata.path = "pinata_issue.png" //read more here https://github.com/PinataCloud/Pinata-SDK/issues/28#issuecomment-816439078
    const res_metadata = await pinata.pinFileToIPFS(stream_metadata, options_metadata)
    res.status(200).json({ result: "https://ipfs.io/ipfs/" + res_metadata.IpfsHash })
  }
  catch (err) {
    res.status(500).json({ result: 'Error' })
  }
}