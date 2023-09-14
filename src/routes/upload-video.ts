import { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { pipeline } from "node:stream";
import { promisify } from "node:util";

import fastifyMultipart from "@fastify/multipart";
import path from "node:path";
import fs from "node:fs";
import { prisma } from "../lib/prisma";

const pump = promisify(pipeline)

export async function uploadVideoRoute(app: FastifyInstance) {

    app.register(fastifyMultipart, {
        limits: {
            fieldSize: 1_048_576 * 25
        }
    });

    app.post("/videos", async (req, reply) => {
        const data = await req.file();
        if (!data) {
            return reply.status(400).send({ error: "Missing file input" });
        }
        const extension = path.extname(data.filename);
        if (extension != ".mp3") {
            return reply.status(400).send({ error: "Invalid filte type" });
        }
        const fileBaseName = path.basename(data.filename, extension);
        const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`;
        const uploadSource = path.resolve(__dirname,"../../tmp", fileUploadName);
        await pump(data.file, fs.createWriteStream(uploadSource));
        const video = await prisma.video.create({
            data: {
                name: data.filename,
                path: uploadSource,
            }
        });
        return video;
    });
    
}