import { IsNotEmpty, IsString, IsOptional, MaxLength } from "class-validator";

export class CastVoteDto {
  @IsNotEmpty({ message: "Option ID is required" })
  @IsString({ message: "Option ID must be a string" })
  optionId: string;

  @IsOptional()
  @IsString()
  @MaxLength(128)
  voterToken?: string;
}

export class CreatePollDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNotEmpty()
  options: { text: string; contestantId?: string; imageUrl?: string }[];

  @IsOptional()
  startsAt?: string;

  @IsOptional()
  endsAt?: string;
}
