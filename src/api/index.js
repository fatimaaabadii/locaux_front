import axios from "axios";
import { setCookie, getCookie, deleteCookie } from "cookies-next";

const client = axios.create({
    baseURL: "http://localhost:8080",
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
         //   deleteCookie('token');
         //   window.location.href = '/login';
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


