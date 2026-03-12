"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/firebase/config";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1. Create the user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Create a matching document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
      });

      alert("Account created successfully!");
    } catch (error: any) {
      console.error(error.message);
      alert("Error: " + error.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Sign Up</h2>
      <form onSubmit={handleSignUp}>
        <input 
          type="email" 
          placeholder="Email" 
          onChange={(e) => setEmail(e.target.value)} 
          required 
        />
        <br /><br />
        <input 
          type="password" 
          placeholder="Password (min 6 chars)" 
          onChange={(e) => setPassword(e.target.value)} 
          required 
        />
        <br /><br />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}