import crypto from 'crypto';

interface VoteData {
  electionId: string;
  voterId: string;
  candidateId: string;
  position: string;
  timestamp: Date;
}

export function generateFingerprint(prevFingerprint: string, voteData: VoteData): string {
  const data = {
    prev: prevFingerprint,
    electionId: voteData.electionId,
    voterId: voteData.voterId,
    candidateId: voteData.candidateId,
    position: voteData.position,
    timestamp: voteData.timestamp.toISOString(),
  };
  
  const dataString = JSON.stringify(data);
  return crypto.createHash('sha256').update(dataString).digest('hex');
}

export function verifyIntegrityChain(ballots: Array<{
  fingerprint: string;
  electionId: string;
  voterId: string;
  candidateId: string;
  position: string;
  castAt: Date;
}>): boolean {
  if (ballots.length === 0) return true;

  let expectedFingerprint = `genesis:${ballots[0].electionId}`;
  
  for (const ballot of ballots) {
    const computedFingerprint = generateFingerprint(expectedFingerprint, {
      electionId: ballot.electionId,
      voterId: ballot.voterId,
      candidateId: ballot.candidateId,
      position: ballot.position,
      timestamp: ballot.castAt,
    });

    if (computedFingerprint !== ballot.fingerprint) {
      return false;
    }

    expectedFingerprint = ballot.fingerprint;
  }

  return true;
}