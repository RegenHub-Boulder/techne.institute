/**
 * merkle.js — Browser-side merkle tree utility for REA state verification
 *
 * Uses Web Crypto API (SHA-256). No external dependencies.
 *
 * The merkle root is computed identically to the Supabase function:
 *   Leaf  = sha256(account_key + ':' + balance)
 *   Root  = sha256(sorted_leaf_hashes concatenated)  ← flat hash (tamper-evident)
 *
 * For proof generation we build a binary tree from the sorted leaves.
 */

/** SHA-256 a string, return hex */
async function sha256hex(str) {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(str)
  )
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Compute the flat merkle root from an array of ledger accounts.
 * Matches the SQL compute_merkle_root() function.
 *
 * @param {Array<{account_key: string, balance: string|number}>} accounts — sorted by account_key
 * @returns {Promise<string>} hex merkle root
 */
export async function computeMerkleRoot(accounts) {
  if (!accounts || accounts.length === 0) return ''

  // Sort by account_key (same as SQL ORDER BY account_key)
  const sorted = [...accounts].sort((a, b) =>
    a.account_key.localeCompare(b.account_key)
  )

  // Compute leaf hashes
  const leafHashes = await Promise.all(
    sorted.map((a) => sha256hex(`${a.account_key}:${Number(a.balance).toFixed(6)}`))
  )

  // Flat root = sha256 of concatenated leaf hashes
  return sha256hex(leafHashes.join(''))
}

/**
 * Build a binary merkle tree from leaf hashes (for proof generation).
 * Returns array of levels: levels[0] = leaves, levels[last] = [root]
 */
async function buildBinaryTree(leafHashes) {
  const levels = [leafHashes]
  let current = leafHashes

  while (current.length > 1) {
    const next = []
    for (let i = 0; i < current.length; i += 2) {
      const left = current[i]
      const right = current[i + 1] ?? current[i] // duplicate last if odd
      next.push(await sha256hex(left + right))
    }
    levels.push(next)
    current = next
  }

  return levels
}

/**
 * Generate a merkle proof for a specific account.
 *
 * @param {Array<{account_key, balance}>} accounts
 * @param {string} targetAccountKey
 * @returns {Promise<{leafHash, proofPath, root} | null>}
 */
export async function generateMerkleProof(accounts, targetAccountKey) {
  if (!accounts || accounts.length === 0) return null

  const sorted = [...accounts].sort((a, b) =>
    a.account_key.localeCompare(b.account_key)
  )

  const targetIdx = sorted.findIndex((a) => a.account_key === targetAccountKey)
  if (targetIdx === -1) return null

  const leafHashes = await Promise.all(
    sorted.map((a) => sha256hex(`${a.account_key}:${Number(a.balance).toFixed(6)}`))
  )

  const levels = await buildBinaryTree(leafHashes)
  const root = levels[levels.length - 1][0]
  const leafHash = leafHashes[targetIdx]

  // Walk up the tree collecting sibling hashes
  const proofPath = []
  let idx = targetIdx

  for (let level = 0; level < levels.length - 1; level++) {
    const isRight = idx % 2 === 1
    const siblingIdx = isRight ? idx - 1 : idx + 1
    const sibling = levels[level][siblingIdx] ?? levels[level][idx] // duplicate if no sibling

    proofPath.push({
      position: isRight ? 'left' : 'right',
      hash: sibling,
    })

    idx = Math.floor(idx / 2)
  }

  return { leafHash, proofPath, root }
}

/**
 * Verify a merkle proof.
 *
 * @param {string} leafHash
 * @param {Array<{position:'left'|'right', hash:string}>} proofPath
 * @param {string} expectedRoot
 * @returns {Promise<boolean>}
 */
export async function verifyMerkleProof(leafHash, proofPath, expectedRoot) {
  let current = leafHash

  for (const { position, hash } of proofPath) {
    if (position === 'left') {
      current = await sha256hex(hash + current)
    } else {
      current = await sha256hex(current + hash)
    }
  }

  return current === expectedRoot
}

/**
 * Compute leaf hash for a single account (for display / quick verification).
 */
export async function computeLeafHash(accountKey, balance) {
  return sha256hex(`${accountKey}:${Number(balance).toFixed(6)}`)
}
