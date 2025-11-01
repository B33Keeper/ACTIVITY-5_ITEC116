"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const path_1 = require("path");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((err, req, res, next) => {
        if (err && err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                statusCode: 400,
                message: 'File too large. Maximum size is 5MB.',
            });
        }
        if (err && err.code === 'INVALID_FILE_TYPE') {
            return res.status(400).json({
                statusCode: 400,
                message: err.message || 'Invalid file type. Accepted formats: JPG, JPEG, PNG, GIF, WEBP',
            });
        }
        next(err);
    });
    app.useStaticAssets((0, path_1.join)(__dirname, '..', 'uploads'), {
        prefix: '/uploads',
    });
    app.enableCors({ origin: true });
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Activity5 Blog API')
        .setDescription('Blog API with users, posts, comments, and auth')
        .setVersion('1.0')
        .addBearerAuth()
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
//# sourceMappingURL=main.js.map