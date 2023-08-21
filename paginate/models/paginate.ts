import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

enum DirectionTypeEnum {
  DESC = 'desc',
  ASC = 'asc',
}
export class BaseFilter {
  @ApiProperty({
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    return Number(value);
  })
  limit: number;

  @ApiProperty({
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => {
    return Number(value);
  })
  page: number;

  @IsOptional()
  @IsEnum(DirectionTypeEnum)
  direction: DirectionType;

  @IsOptional()
  @IsString()
  field: any;
}

export declare type FindOptionsField<Entity> = keyof Entity;

export declare type FindOptionsFields<Entity> = (keyof Entity)[];

export type Operator =
  | 'EQ'
  | 'GT'
  | 'GTE'
  | 'LT'
  | 'LTE'
  | 'IN'
  | 'NORMAL'
  | 'BETWEEN'
  | 'LIKE'
  | 'LIKE_RIGHT'
  | 'LIKE_LEFT';

export type DirectionType = 'desc' | 'asc';
