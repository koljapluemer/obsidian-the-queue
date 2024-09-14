import { Notice, TFile, Vault } from 'obsidian';

// Function to retrieve a random file from the vault
export async function getRandomFile(vault: Vault): Promise<TFile | null> {
  const allFiles = vault.getFiles();
  if (!allFiles.length) {
    new Notice('No files in the vault!');
    return null;
  }

  const randomIndex = Math.floor(Math.random() * allFiles.length);
  return allFiles[randomIndex];
}
