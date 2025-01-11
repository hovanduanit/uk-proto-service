import { Module } from '@nestjs/common';
import { ProtoModule } from './proto/proto.module';

@Module({
  imports: [ProtoModule],
})
export class AppModule {}
