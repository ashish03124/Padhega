"use client";

import { useMusicContext } from '../context/MusicContext';

export const useMusicPlayer = () => {
    return useMusicContext();
};
