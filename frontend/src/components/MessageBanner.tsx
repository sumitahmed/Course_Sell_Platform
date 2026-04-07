interface MessageBannerProps {
  variant: "error" | "success" | "info";
  message: string;
}

export function MessageBanner({ variant, message }: MessageBannerProps) {
  if (!message) {
    return null;
  }

  return (
    <p className={`message message-${variant}`} role="status">
      {message}
    </p>
  );
}
