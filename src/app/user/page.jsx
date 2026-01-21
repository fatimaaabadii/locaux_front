"use client";
import React, { useState } from 'react';
import { api, getTickets, getUsers, getCurrentUser } from "/src/api";
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "/src/components/ui/use-toast";
import Image from 'next/image';


function ProfilePage() {
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('Délégué');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordChangeMessage, setPasswordChangeMessage] = useState('');
  const [selectedValue, setselectedValue] = useState();
  const { toast } = useToast();
  const token = getCookie('token'); 
    const headers = {
        Authorization: `Bearer ${token}`
    };
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser(),
  });

  console.log(userData);
  const handleSubmitPasswordChange = async (e) => {
    e.preventDefault();
    if (oldPassword && newPassword && confirmNewPassword && newPassword === confirmNewPassword) {
      try {
        const parsedValue = {
         
          oldPassword: oldPassword, // Assurez-vous que les valeurs sont définies
          newPassword: newPassword,
          confirmPassword: confirmNewPassword,
          
        };
        await api.put("/auth/changepsw/" + userData.id,parsedValue , { headers });
        toast({
          description: "Modification de mot de passe réussie",
          className: "bg-green-500 text-white",
          duration: 2000,
          title: "Success",
        });
       
        
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        setPasswordChangeMessage('Mot de passe modifié avec succès.');
      } catch (error) {
        toast({
          description: "Erreur lors de la modification de mot de passe",
          className: "bg-red-500 text-white",
          duration: 2000,
          title: "Error",
        });
        console.error(error);
      }
    } else {
      setPasswordChangeMessage('Veuillez remplir correctement tous les champs.');
    }
  }; 
 
  return  (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f5f6fa',  marginLeft: '250px'  }}>
      <div style={{ width: '900px', display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: '10px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)', backgroundColor: 'white' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '20px' }}>
          <div style={{ marginRight: '20px' }}>
          <Image src="/pp.jpg" alt="User" width={170} height={170} style={{ borderRadius: '50%' }} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', marginBottom: '5px' }}>{userData?.name}</h1>
            <p style={{ fontSize: '16px', color: '#666' }}>{userData?.email}</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '90%', marginBottom: '20px' }}>
          <div style={{ flex: '1', backgroundColor: '#f0f0f0', borderRadius: '10px', padding: '20px', marginRight: '10px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '40px' }}>Informations personnelles</h2>
            
            <div style={{ marginBottom: '10px' }}>
              <strong>Email:</strong> {userData?.email}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Coordination:</strong> {userData?.coordination}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Délégation:</strong> {userData?.delegation}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Rôle:</strong> {userData?.roles}
            </div>
          </div>
          <div style={{ flex: '1', backgroundColor: '#f0f0f0', borderRadius: '10px', padding: '20px', marginLeft: '10px' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Modifier le mot de passe</h2>
            <form onSubmit={handleSubmitPasswordChange}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Ancien mot de passe:</label>
                <input type="password" style={{ padding: '5px', borderRadius: '3px', border: '1px solid #ccc', width: '100%' }} value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Nouveau mot de passe:</label>
                <input type="password" style={{ padding: '5px', borderRadius: '3px', border: '1px solid #ccc', width: '100%' }} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Confirmer le nouveau mot de passe:</label>
                <input type="password" style={{ padding: '5px', borderRadius: '3px', border: '1px solid #ccc', width: '100%' }} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
              </div>
              <button type="submit" style={{ padding: '8px 83px', backgroundColor: '#343a40', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer' , margin: 'auto' }}>Changer le mot de passe</button>
              {passwordChangeMessage && <p style={{ color: 'green', marginTop: '10px' }}>{passwordChangeMessage}</p>}
            </form>
          </div>
        </div>
      </div>
    </div>
    

   
  );
}

export default ProfilePage;