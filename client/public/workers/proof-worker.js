// Web Worker for ZK proof generation
// Keeps the main thread responsive during proof generation

// Try to import snarkjs, fall back gracefully if it fails
try {
  importScripts('https://unpkg.com/snarkjs@0.7.1/build/snarkjs.min.js');
} catch (error) {
  console.log('[WORKER] Failed to load snarkjs from CDN, will signal fallback to main thread');
  self.postMessage({
    type: 'error',
    error: 'snarkjs-load-failed'
  });
}

let circuitWasm = null;
let provingKey = null;
let verificationKey = null;

// Load circuit artifacts
async function loadArtifacts() {
  if (circuitWasm && provingKey && verificationKey) {
    return;
  }

  try {
    // Load WASM
    const wasmResponse = await fetch('/circuits/client.wasm');
    circuitWasm = await wasmResponse.arrayBuffer();

    // Load proving key
    const zkeyResponse = await fetch('/circuits/client.zkey');
    provingKey = await zkeyResponse.arrayBuffer();

    // Load verification key
    const vkResponse = await fetch('/circuits/verification_key.json');
    verificationKey = await vkResponse.json();

    postMessage({
      type: 'artifacts-loaded',
      success: true
    });

  } catch (error) {
    postMessage({
      type: 'artifacts-loaded',
      success: false,
      error: error.message
    });
  }
}

// Generate witness
async function generateWitness(inputs) {
  try {
    postMessage({
      type: 'progress',
      stage: 'generating-witness',
      progress: 30
    });

    const { witness } = await snarkjs.wtns.calculate(inputs, circuitWasm);

    postMessage({
      type: 'progress',
      stage: 'witness-complete',
      progress: 50
    });

    return witness;

  } catch (error) {
    postMessage({
      type: 'error',
      error: `Witness generation failed: ${error.message}`
    });
    throw error;
  }
}

// Generate Groth16 proof
async function generateProof(witness) {
  try {
    postMessage({
      type: 'progress',
      stage: 'generating-proof',
      progress: 60
    });

    const { proof, publicSignals } = await snarkjs.groth16.prove(provingKey, witness);

    postMessage({
      type: 'progress',
      stage: 'proof-complete',
      progress: 90
    });

    return {
      proof: {
        pi_a: [proof.pi_a[0], proof.pi_a[1]],
        pi_b: [[proof.pi_b[0][1], proof.pi_b[0][0]], [proof.pi_b[1][1], proof.pi_b[1][0]]],
        pi_c: [proof.pi_c[0], proof.pi_c[1]],
        protocol: "groth16",
        curve: "bn128"
      },
      publicSignals
    };

  } catch (error) {
    postMessage({
      type: 'error',
      error: `Proof generation failed: ${error.message}`
    });
    throw error;
  }
}

// Verify proof
async function verifyProof(proofData) {
  try {
    postMessage({
      type: 'progress',
      stage: 'verifying',
      progress: 95
    });

    const isValid = await snarkjs.groth16.verify(
      verificationKey,
      proofData.publicSignals,
      proofData.proof
    );

    return isValid;

  } catch (error) {
    console.error('Proof verification failed:', error);
    return false;
  }
}

// Main message handler
self.onmessage = async function(e) {
  const { type, data } = e.data;

  try {
    switch (type) {
      case 'load-artifacts':
        await loadArtifacts();
        break;

      case 'generate-proof':
        const { inputs } = data;
        
        // Ensure artifacts are loaded
        if (!circuitWasm || !provingKey || !verificationKey) {
          await loadArtifacts();
        }

        postMessage({
          type: 'progress',
          stage: 'starting',
          progress: 10
        });

        // Generate witness
        const witness = await generateWitness(inputs);

        // Generate proof
        const proofData = await generateProof(witness);

        // Verify proof
        const isValid = await verifyProof(proofData);

        if (!isValid) {
          throw new Error('Generated proof is invalid');
        }

        postMessage({
          type: 'proof-complete',
          success: true,
          proof: proofData,
          progress: 100
        });
        break;

      default:
        postMessage({
          type: 'error',
          error: `Unknown message type: ${type}`
        });
    }

  } catch (error) {
    postMessage({
      type: 'error',
      error: error.message
    });
  }
};