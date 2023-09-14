import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { createReadStream } from 'node:fs';
import { openai } from "../lib/openai";

export async function createTranscriptionRoute(app: FastifyInstance) {

    app.post("/videos/:videoId/transcription", async (req) => {
        const paramScheme = z.object({ videoId: z.string().uuid() });
        const { videoId } = paramScheme.parse(req.params);

        const bodyScheme = z.object({ prompt: z.string() });
        const { prompt } = bodyScheme.parse(req.body);

        const video = await prisma.video.findUniqueOrThrow({
            where: {
                id: videoId
            }
        });

        const videoPath = video.path;
        const autoReadStream = createReadStream(videoPath);
        const response = await openai.audio.transcriptions.create({
            file: autoReadStream,
            model: "whisper-1",
            language: "pt",
            response_format: "json",
            temperature: 0,
            prompt
        });
        
        let transcription = response.text;

        await prisma.video.update({
            where: {
                id: videoId
            }, 
            data: {
                trascription: transcription
            }
        });
        
        return transcription;
    });

}