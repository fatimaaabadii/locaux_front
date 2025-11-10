import axios from "axios";
import { setCookie, getCookie, deleteCookie } from "cookies-next";

const client = axios.create({
    baseURL: "https://intramail.entraide.ma/api/",
    headers: {
        "Content-Type": "application/json",
    },
});

client.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response.status === 401) {
            console.log('error 401');
        } if (error.response.status === 403) {
            console.log('error 403');
            deleteCookie('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

client.interceptors.request.use(
    (config) => {
        const token = getCookie('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
export const api = client;





export function getProgrammes() {
    return async () => {
        // TODO checks and params to all custom hooks

        const token = getCookie('token');
        const { data } = await api.get('/programmes', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return data;
    };
}


export function getMessage() {
    return async () => {
        // TODO checks and params to all custom hooks

        const token = getCookie('token');
        const { data } = await api.get('/message/getAll', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return data;
    };
}


function formatDateToLongDateString(timestamp) {
    const date = new Date(timestamp);
    const options = {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
    };

    // Formater la date en format long
    const formattedDate = date.toLocaleDateString('en-US', options);
    return formattedDate;
}





export async function getUsers() {
    try {
      const token = getCookie("token");
      
      const response = await api.get("/auth/getUsers" ,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      return response.data;
      
    } catch (error) {
      console.log(error);
    }

}
export async function getUnits() {
    try {
      const token = getCookie("token");
      
      const response = await api.get("/uniteOrganisationnelle/getAll" ,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(response.data);
      return response.data;
      
    } catch (error) {
      console.log(error);
    }

}

export function getOperations() {
    return async () => {
        // TODO checks and params to all custom hooks

        const token = getCookie('token');
        const { data } = await api.get('/receptions', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return data;
    };
}

export async function getOperationsByDelegations(iddeleg) {
    try {
      const token = getCookie("token");
  
      // Utiliser la syntaxe de template string pour inclure `iddeleg` dans l'URL
      const response = await api.get(`/receptions/province/${iddeleg}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
     //  console.log(response.data); // Décommentez cette ligne si vous voulez voir la réponse dans la console
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
  
export function getProduits() {
    return async () => {
        // TODO checks and params to all custom hooks

        const token = getCookie('token');
        const { data } = await api.get('/produits', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return data;
    };
}
export function getPrestations() {
    return async () => {
        // TODO checks and params to all custom hooks

        const token = getCookie('token');
        const { data } = await api.get('/api/prestations', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return data;
    };
}


export function getTypePrestations() {
    return async () => {
        // TODO checks and params to all custom hooks

        const token = getCookie('token');
        const { data } = await api.get('/type-prestations', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return data;
    };
}



export function getLocaux() {
    return async () => {
        // TODO checks and params to all custom hooks

        const token = getCookie('token');
        const { data } = await api.get('/locaux', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return data;
    };
}




export function getDelegations() {
    return async () => {
        // TODO checks and params to all custom hooks

        const token = getCookie('token');
        const { data } = await api.get('/delegation/getDelegations', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return data;
    };
}
const tokenPayload = async () => {
    const token = await getCookie('token');
    if (!token) return null;
    const payload = token?.split('.')[1];
    const decodedPayload = await atob(payload);
    const tokenPay = JSON.parse(decodedPayload);
    return tokenPay?.sub;
}
/*export function getCurrentUser() {
    return async () => {
        const email = await tokenPayload();
        if (!email) return null;
        const token = getCookie('token');
        const { data } = await api.get('/auth/email/' + email, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return data;
    }*/




    export async function getGroupMembers() {
        try {
          const token = getCookie("token");
          
          const response = await api.get("/membreGroupe/getAll" ,{
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          console.log(response.data);
          return response.data;
          
        } catch (error) {
          console.log(error);
        }

    }

    



    




        export async function getGroups() {
            try {
              const token = getCookie("token");
              
              const response = await api.get("/groupeDistribution/getAll" ,{
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });
              console.log(response.data);
              return response.data;
              
            } catch (error) {
              console.log(error);
            }

        }









 export async function getCurrentUser() {
        try {
          const token = getCookie("token");
          const email = await tokenPayload();
          const response = await api.get("/auth/email/" + email, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
         // console.log(response.data);
          return response.data;
          
        } catch (error) {
          console.log(error);
        }
      };


export async function getStockActuel() {
  try {
    const token = getCookie("token");
    
    const response = await api.get('/reception/details/stockActuel' ,{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  // console.log(response.data);
    return response.data;
    
  } catch (error) {
    console.log(error);
  }

}


export async function getPreparation(iddeleg) {
    try {
      const token = getCookie("token");
      
      const response = await api.get(`/preparation/delegation/${iddeleg}` ,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    console.log("token",token);
      return response.data;
      
    } catch (error) {
      console.log(error);
    }

}

export function getPreparations() {
    return async () => {
        // TODO checks and params to all custom hooks

        const token = getCookie('token');
        const { data } = await api.get('/preparation', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return data;
    };
}


export async function getDistribution(iddeleg) {
    try {
      const token = getCookie("token");
      
      const response = await api.get(`/distribution/delegation/${iddeleg}` ,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    // console.log(response.data);
      return response.data;
      
    } catch (error) {
      console.log(error);
    }

}


export async function getStocktotalByDelegation(iddeleg) {
    try {
      const token = getCookie("token");
  
      // Utiliser la syntaxe de template string pour inclure `iddeleg` dans l'URL
      const response = await api.get(`/reception/details/quantite-par-produit`, {
        params: { delegationId: iddeleg },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      // console.log(response.data); // Décommentez cette ligne si vous voulez voir la réponse dans la console
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }
  
  export function getPartenariats() {
    return async () => {
        // TODO checks and params to all custom hooks

        const token = getCookie('token');
        const { data } = await api.get('/partenariats', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return data;
    };
}

  export function getDomaines() {
    return async () => {
        // TODO checks and params to all custom hooks

        const token = getCookie('token');
        const { data } = await api.get('/api/domaines-partenariat', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return data;
    };
}

  export function getPopulationsCibles() {
    return async () => {
        // TODO checks and params to all custom hooks

        const token = getCookie('token');
        const { data } = await api.get('/api/populations-cibles', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return data;
    };
}
 export function getContributionsEntraide() {
    return async () => {
        // TODO checks and params to all custom hooks

        const token = getCookie('token');
        const { data } = await api.get('/api/contributions-partenariat', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return data;
    };
}


 export function getTypesCentre() {
    return async () => {
        // TODO checks and params to all custom hooks

        const token = getCookie('token');
        const { data } = await api.get('/api/types-centre', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return data;
    };
}

 export function getContributionsPartenaires() {
    return async () => {
        // TODO checks and params to all custom hooks

        const token = getCookie('token');
        const { data } = await api.get('/api/contributions-partenaires', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        return data;
    };

  
    
}

export function downloadPieceJointePartenariat(partenariatId) {
    return async () => {
        const token = getCookie('token');

        const url = `/partenariats/${partenariatId}/telecharger`;

        const response = await api.get(url, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            responseType: "blob", // obligatoire pour les fichiers
        });

        // Création du lien pour téléchargement
        const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");

        // Récupère le nom du fichier depuis l'entête Content-Disposition si disponible
        const disposition = response.headers["content-disposition"];
        let fileName = "piece_jointe.pdf";
        if (disposition && disposition.includes("filename=")) {
            fileName = disposition
                .split("filename=")[1]
                .replace(/"/g, "")
                .trim();
        }

        link.href = blobUrl;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(blobUrl);

        return true; // ou retourne des infos supplémentaires si nécessaire
    };
}