'use server';

import { revalidatePath } from 'next/cache';

export const invalidateCaching = () => {
  revalidatePath('/');
};

export const invalidatePath = (path: string) => {
  revalidatePath(path, 'layout');
};
