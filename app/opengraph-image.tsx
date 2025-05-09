import { ImageResponse } from 'next/og';
 
// route segment config
export const runtime = 'edge';
 
// image metadata
export const alt = 'Mutatio - A Modern LLM Prompt Experimentation Platform';
export const size = {
  width: 1200,
  height: 630,
};
 
export const contentType = 'image/png';
 
// image generation
export default async function Image() {
  return new ImageResponse(
    (
      // imageResponse JSX element
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(to bottom, #000000, #111133)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 50,
          textAlign: 'center',
          color: 'white',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 80,
            fontWeight: 700,
            background: 'linear-gradient(to bottom right, #ffffff, #8a2be2)',
            backgroundClip: 'text',
            color: 'transparent',
            marginBottom: 20,
          }}
        >
          mutatio
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: '#f0f0f0',
            marginTop: 20,
          }}
        >
          A Modern LLM Prompt Experimentation Platform
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}