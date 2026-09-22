/** Identificador único local (tempo + aleatório), estável entre backup e restauração. */
export function newId(): string {
  const time = Date.now().toString(36);
  const random = Array.from({ length: 3 }, () => Math.random().toString(36).slice(2, 8)).join('');
  return `${time}${random}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
