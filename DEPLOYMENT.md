# Deploying to Vercel

To deploy this SalonStack application to Vercel, follow these steps:

1. **Push your code to Git**: Create a repository on GitHub, GitLab, or Bitbucket and push your current code.
2. **Import to Vercel**: 
   - Log in to [Vercel](https://vercel.com).
   - Click **Add New** > **Project**.
   - Select your repository from the list.
3. **Configure Project**:
   - Vercel will automatically detect **Next.js** as the framework.
   - You do not need to change the build commands or output directory.
4. **Environment Variables**:
   - The application currently uses the Firebase configuration hardcoded in `src/firebase/config.ts`. Since these are public client-side keys, they will work on Vercel without additional configuration.
5. **Deploy**: Click the **Deploy** button.
6. **Final Step - Firebase Authorized Domains**:
   - After the deployment finishes, copy your Vercel URL (e.g., `https://salonstack-xyz.vercel.app`).
   - Go to the [Firebase Console](https://console.firebase.google.com/).
   - Navigate to **Authentication** > **Settings** > **Authorized Domains**.
   - Click **Add Domain** and paste your Vercel URL. This is critical for Firebase Auth to function correctly on your live site.

## Production Note
Ensure that your Firestore Security Rules and Authentication providers (Email/Password) are enabled in the Firebase Console for the production environment.