import { Module } from '@nestjs/common';
import { ProtoController } from './proto.controller';

@Module({
  controllers: [ProtoController],
})
export class ProtoModule {}
