import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import FormData from 'form-data';
import fetch from 'node-fetch';

async function testPipeline() {
  console.log("=== Starting End-to-End Integration Test ===");
  
  // Create Form Data
  const form = new FormData();
  const resumePath = path.join(__dirname, '../ml-service/test_resume.pdf');
  form.append('resume', fs.createReadStream(resumePath));
  form.append('githubUrl', 'https://github.com/octocat');
  form.append('jobDescription', 'Senior React Developer');

  console.log("-> Dispatching Evaluate request to backend...");
  
  try {
    const res = await fetch('http://localhost:3001/api/evaluate', {
      method: 'POST',
      body: form
    });
    
    if (!res.ok) {
      const errorData = await res.text();
      console.error("❌ Evaluation Failed with status: " + res.status);
      console.error(errorData);
      return;
    }
    
    const result = await res.json();
    
    console.log("✅ Pipeline completed successfully!");
    console.log("Candidate Name:", result.candidate.name);
    console.log("Final ML Score:", result.candidate.final_score, "/ 100");
    console.log("Verdict:", result.candidate.decision);
    console.log("Debate Consensus:", result.candidate.debate_result.consensus_verdict);
    console.log("AI Explanation:", result.candidate.explanation.explanation_paragraph);
    
    // Check if agents returned populated objects
    const hasConsistency = result.candidate.consistency_report?.consistency_score !== undefined;
    const hasDebate = result.candidate.debate_result?.consensus_verdict !== undefined;
    const hasExplanation = result.candidate.explanation?.explanation_paragraph !== undefined;
    
    if(hasConsistency && hasDebate && hasExplanation) {
       console.log("✅ All agent modules returned valid responses!");
    } else {
       console.error("❌ Some agent modules are missing data.");
       console.log("Debate:", hasDebate, "Consistency:", hasConsistency, "Explain:", hasExplanation);
    }
    
    console.log("==========================================");

  } catch (error) {
    console.error("❌ Test crashed:", error.message);
  }
}

testPipeline();
