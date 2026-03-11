# Resume Evaluation Form — Vercel Deployment

## Quick Deploy (5 minutes)

### 1. Push to GitHub
```bash
cd resume-eval-form
git init
git add .
git commit -m "Resume evaluation form"
gh repo create resume-eval-form --public --push
# OR push manually to your GitHub account
```

### 2. Deploy on Vercel
1. Go to vercel.com → Sign in with GitHub
2. Click "Import Project" → Select your `resume-eval-form` repo
3. Click "Deploy" (defaults work fine)
4. Your form is live at `https://resume-eval-form.vercel.app`

### 3. Set Environment Variables (optional but recommended)
In Vercel Dashboard → Settings → Environment Variables:
- `ADMIN_KEY`: A secret string to access responses (e.g., `my-secret-key-2024`)

### 4. Add Your Actual Resumes
Replace the sample resumes in `lib/resumes.js` with your real data:
```bash
# In your research project directory:
python select_form_resumes.py > form_output.txt
```
Then convert the output into the JavaScript format in `lib/resumes.js`.
Each resume needs: `{ id, category, text }`

### 5. Share the URL
Send your Vercel URL to LinkedIn contacts. The form works on mobile and desktop.

## Collecting Responses

### View responses
Visit: `https://your-app.vercel.app/api/responses?key=YOUR_ADMIN_KEY`

### Download all responses as JSON
```bash
curl "https://your-app.vercel.app/api/responses?key=YOUR_ADMIN_KEY" > responses.json
```

### Convert to analysis format
```python
import json

with open("responses.json") as f:
    data = json.load(f)

# Flatten for analysis
human_data = []
for resp in data["responses"]:
    for eval in resp["evaluations"]:
        eval["evaluator_id"] = resp["evaluator"]["name"]
        eval["evaluator_email"] = resp["evaluator"]["email"]
        eval["evaluator_role"] = resp["evaluator"]["role"]
        eval["evaluator_years"] = resp["evaluator"]["years"]
        human_data.append(eval)

with open("data/human/human_ratings.json", "w") as f:
    json.dump(human_data, f, indent=2)

print(f"Saved {len(human_data)} ratings")
```

## Important Notes

### Data Persistence on Vercel
Vercel serverless functions use `/tmp` which is ephemeral — data can be lost
when the function cold-starts. For reliable storage, choose one of:

1. **Google Sheets webhook** (free, easy):
   - Create a Google Apps Script web app that writes to a Sheet
   - Set `GOOGLE_SHEETS_WEBHOOK` env var in Vercel

2. **Vercel KV** (free tier: 3000 requests/day):
   - `npm install @vercel/kv`
   - Enable KV in Vercel dashboard
   - Uncomment the KV code in `app/api/submit/route.js`

3. **Supabase** (free tier: 500MB):
   - Most robust option for serious data collection

For your study size (~10 evaluators), the `/tmp` approach works fine
as long as you download responses regularly.

### Mobile Responsive
The form works on phones — important since LinkedIn DMs often open on mobile.
