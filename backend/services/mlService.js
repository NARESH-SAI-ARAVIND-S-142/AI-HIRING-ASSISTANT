import fetch from 'node-fetch';
import FormData from 'form-data';

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';

export const parseResume = async (fileBuffer, filename) => {
  const formData = new FormData();
  formData.append('file', fileBuffer, {
    filename: filename,
    contentType: 'application/pdf',
  });

  const response = await fetch(`${ML_SERVICE_URL}/parse`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`ML Service parse failed: ${response.statusText}`);
  }

  const result = await response.json();
  if (!result.success) throw new Error('ML parse unsuccessful');
  return result.data;
};

export const getScores = async (parsedResume, githubData, jobKeywords) => {
  const response = await fetch(`${ML_SERVICE_URL}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      parsed_resume: parsedResume,
      github_data: githubData,
      job_keywords: jobKeywords,
    }),
  });

  if (!response.ok) {
    throw new Error(`ML Service score failed: ${response.statusText}`);
  }

  const result = await response.json();
  return result;
};
