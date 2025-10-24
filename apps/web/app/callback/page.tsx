import {CodeDisplay} from '@/components/CodeDisplay/CodeDisplay';

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const SpotifyCallbackPage = async ({ searchParams }: Props) => {
  const resolvedSearchParams = await searchParams;
  const code = resolvedSearchParams.code as string | undefined;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">Spotify Callback</h1>
      {code ? (
        <CodeDisplay code={code} />
      ) : (
        <p className="text-red-500">No code received from Spotify</p>
      )}
    </div>
  );
};

export default SpotifyCallbackPage;