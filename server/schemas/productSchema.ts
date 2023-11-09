import mongoose from "mongoose";
import { z } from "zod";
import { categoryBodySchema } from "./categorySchema";

export const productBodySchema = z
  .object({
    name: z.string({
      required_error: "Name is required",
    }),
    description: z.string({
      required_error: "Description is required",
    }),
    price: z.number({
      required_error: "Price is required",
    }),
    category: categoryBodySchema,
    images: z.array(
      z.string({
        required_error: "Images are required",
      })
    ),
  })
  .strict();

export const uptadeProductSchema = z.object({
  body: z
    .object({
      name: z.string().optional(),
      price: z.number().optional(),
      description: z.string().optional(),
      images: z.array(z.string()).optional(),
    })
    .strict(),
});



export const productSchema = z.object({
  body: productBodySchema
  .merge(
    z.object({
      categoryId: z
        .string()
        .refine((val) => mongoose.Types.ObjectId.isValid(val)),
      category: z.undefined(),
    })
  )
  .strict(),
});