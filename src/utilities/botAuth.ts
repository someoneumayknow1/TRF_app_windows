export function getBotToken(): string | null {
  return localStorage.getItem('botToken');
}

export function setBotToken(token: string): void {
  localStorage.setItem('botToken', token);
}

export function clearBotToken(): void {
  localStorage.removeItem('botToken');
}

export function isBotAuthed(): boolean {
  return !!getBotToken();
}
