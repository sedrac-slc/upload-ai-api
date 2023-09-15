import {fastify} from 'fastify';
import { fastifyCors } from '@fastify/cors';
import { getAllPromptsRoute } from './routes/get-all-prompts';
import { uploadVideoRoute } from './routes/upload-video';
import { createTranscriptionRoute } from './routes/create-trascription';
import { generateTransitionRoute } from './routes/generator-trascription';

const app = fastify();

app.register(fastifyCors, {
    origin: '*'
})

app.register(getAllPromptsRoute);
app.register(uploadVideoRoute);
app.register(createTranscriptionRoute);
app.register(generateTransitionRoute);

app.listen({
    port: 3333
}).then(()=>{
    console.log("http://localhost:3333")
})