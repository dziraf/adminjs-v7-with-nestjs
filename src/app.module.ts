import { Module } from '@nestjs/common';
import { AdminModule } from '@adminjs/nestjs';
import { ConfigModule } from '@nestjs/config';
import { Resource, Database, Adapter } from '@adminjs/sql'
import AdminJS from 'adminjs';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

AdminJS.registerAdapter({
  Database,
  Resource,
})

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    AdminModule.createAdminAsync({
      useFactory: async () => {
        const options = {
          connectionString: process.env.DATABASE_URL,
          database: process.env.DATABASE_NAME,
        };
        const db = await new Adapter('postgresql', options).init();

        return {
          adminJsOptions: {
            rootPath: '/admin',
            // Rename "organizations" to your table name or set "resources" to []
            resources: [db.table('organizations')],
          },
          auth: {
            authenticate: async (email, password) => {
              return { email}
            },
            cookiePassword: 'secret',
            cookieName: 'adminjs',
          },
          sessionOptions: {
            resave: true,
            saveUninitialized: true,
            secret: 'secret',
          },
        }
      },
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
