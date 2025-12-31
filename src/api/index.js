import axios from "axios";
import { setCookie, getCookie, deleteCookie } from "cookies-next";

const client = axios.create({
   // baseURL: "https://intramail.entraide.ma/api/",
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




export function getStatistiquesPartenariats() {
    return async () => {
        // TODO checks and params to all custom hooks

        const token = getCookie('token');
        const { data } = await api.get('/api/statistiques/partenariats/dashboard', {
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

export async function getAllDelegations() {
    const token = getCookie('token');
    const { data } = await api.get('/delegation/getDelegations', {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });
    return data;
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

    // ============================================================================
// FORMATION ENDPOINTS
// ============================================================================

    /**
     * Get all formations
     */
    export async function getFormations() {
        try {
            const token = getCookie("token");
            const response = await api.get("/api/formations", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Get formation by ID with attachments
     */
    export async function getFormationById(id) {
        try {
            const token = getCookie("token");
            const response = await api.get(`/api/formations/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Search formations by name
     */
    export async function searchFormations(nom) {
        try {
            const token = getCookie("token");
            const response = await api.get(`/api/formations/search?nom=${nom}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Get active formations (dateFin >= current date)
     */
    export async function getActiveFormations() {
        try {
            const token = getCookie("token");
            const response = await api.get("/api/formations/active", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Create formation WITHOUT attachments (simple JSON)
     */
    export async function createFormationSimple(formation) {
        try {
            const token = getCookie("token");
            const response = await api.post("/api/formations/simple", formation, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Create formation WITH attachments
     * @param {Object} formation - Formation data object
     * @param {File[]} files - Array of File objects
     */
    export async function createFormationWithAttachments(formation, files) {
        try {
            const token = getCookie("token");
            const formData = new FormData();

            // Add formation data as JSON blob
            formData.append(
                "formation",
                new Blob([JSON.stringify(formation)], {
                    type: "application/json",
                })
            );

            // Add files
            if (files && files.length > 0) {
                files.forEach((file) => {
                    formData.append("files", file);
                });
            }

            const response = await api.post("/api/formations", formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Update formation
     */
    export async function updateFormation(id, formation) {
        try {
            const token = getCookie("token");
            const response = await api.put(`/api/formations/${id}`, formation, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Delete formation
     */
    export async function deleteFormation(id) {
        try {
            const token = getCookie("token");
            await api.delete(`/api/formations/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return true;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Upload additional attachments to existing formation
     */
    export async function uploadFormationAttachments(formationId, files) {
        try {
            const token = getCookie("token");
            const formData = new FormData();

            files.forEach((file) => {
                formData.append("files", file);
            });

            const response = await api.post(
                `/api/formations/${formationId}/attachments`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Get formation attachments
     */
    export async function getFormationAttachments(formationId) {
        try {
            const token = getCookie("token");
            const response = await api.get(`/api/formations/${formationId}/attachments`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

// ============================================================================
// AXE ENDPOINTS
// ============================================================================

    /**
     * Get all axes
     */
    export async function getAxes() {
        try {
            const token = getCookie("token");
            const response = await api.get("/api/axes", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(response.data);
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Get axe by ID
     */
    export async function getAxeById(id) {
        try {
            const token = getCookie("token");
            const response = await api.get(`/api/axes/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Get axe by exact name
     */
    export async function getAxeByName(nom) {
        try {
            const token = getCookie("token");
            const response = await api.get(`/api/axes/name/${encodeURIComponent(nom)}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Search axes by name
     */
    export async function searchAxes(nom) {
        try {
            const token = getCookie("token");
            const response = await api.get(`/api/axes/search?nom=${nom}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Create axe
     */
    export async function createAxe(axe) {
        try {
            const token = getCookie("token");
            const response = await api.post("/api/axes", axe, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Update axe
     */
    export async function updateAxe(id, axe) {
        try {
            const token = getCookie("token");
            const response = await api.put(`/api/axes/${id}`, axe, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Delete axe
     */
    export async function deleteAxe(id) {
        try {
            const token = getCookie("token");
            await api.delete(`/api/axes/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return true;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

// ============================================================================
// ATTACHMENT ENDPOINTS
// ============================================================================

    /**
     * Upload single file to formation
     */
    export async function uploadAttachment(formationId, file) {
        try {
            const token = getCookie("token");
            const formData = new FormData();
            formData.append("file", file);

            const response = await api.post(
                `/api/attachments/formation/${formationId}`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Upload multiple files to formation
     */
    export async function uploadMultipleAttachments(formationId, files) {
        try {
            const token = getCookie("token");
            const formData = new FormData();

            files.forEach((file) => {
                formData.append("files", file);
            });

            const response = await api.post(
                `/api/attachments/formation/${formationId}/multiple`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Get attachment by ID
     */
    export async function getAttachmentById(id) {
        try {
            const token = getCookie("token");
            const response = await api.get(`/api/attachments/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Get all attachments for a formation
     */
    export async function getAttachmentsByFormation(formationId) {
        try {
            const token = getCookie("token");
            const response = await api.get(`/api/attachments/formation/${formationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Download attachment file
     */
    export async function downloadAttachment(attachmentId, originalFileName) {
        try {
            const token = getCookie("token");

            const response = await api.get(`/api/attachments/${attachmentId}/download`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                responseType: "blob",
            });

            // Create blob URL and trigger download
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement("a");

            // Get filename from header or use provided name
            const disposition = response.headers["content-disposition"];
            let fileName = originalFileName || "attachment";
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

            return true;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Get attachment preview URL (for images, PDFs)
     */
    export function getAttachmentPreviewUrl(attachmentId) {
        const token = getCookie("token");
        return `${api.defaults.baseURL}/api/attachments/${attachmentId}/preview?token=${token}`;
    }

    /**
     * Delete attachment
     */
    export async function deleteAttachment(attachmentId) {
        try {
            const token = getCookie("token");
            await api.delete(`/api/attachments/${attachmentId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return true;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Delete all attachments for a formation
     */
    export async function deleteAllAttachments(formationId) {
        try {
            const token = getCookie("token");
            await api.delete(`/api/attachments/formation/${formationId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return true;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Get attachment count for a formation
     */
    export async function getAttachmentCount(formationId) {
        try {
            const token = getCookie("token");
            const response = await api.get(
                `/api/attachments/formation/${formationId}/count`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Get total file size for a formation
     */
    export async function getTotalFileSize(formationId) {
        try {
            const token = getCookie("token");
            const response = await api.get(
                `/api/attachments/formation/${formationId}/total-size`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

    /**
     * Get attachments by file type
     */
    export async function getAttachmentsByFileType(formationId, fileType) {
        try {
            const token = getCookie("token");
            const response = await api.get(
                `/api/attachments/formation/${formationId}/type/${encodeURIComponent(fileType)}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.log(error);
            throw error;
        }
    }

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

    /**
     * Format file size from bytes to human readable format
     */
    export function formatFileSize(bytes) {
        if (bytes === 0) return "0 B";
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
        return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    }

    /**
     * Validate file before upload
     */
    export function validateFile(file, maxSize = 5 * 1024 * 1024, allowedTypes = []) {
        // Check file size (default 5MB)
        if (file.size > maxSize) {
            throw new Error(
                `File size exceeds ${formatFileSize(maxSize)}. File: ${file.name}`
            );
        }

        // Check file type if allowedTypes is provided
        if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
            throw new Error(`File type not allowed: ${file.type}. File: ${file.name}`);
        }

        return true;
    }

    /**
     * Validate multiple files
     */
    export function validateFiles(files, maxSize = 5 * 1024 * 1024, allowedTypes = []) {
        const errors = [];

        files.forEach((file) => {
            try {
                validateFile(file, maxSize, allowedTypes);
            } catch (error) {
                errors.push(error.message);
            }
        });

        if (errors.length > 0) {
            throw new Error(errors.join("\n"));
        }

        return true;
    }

    /**
     * Common file types for validation
     */
    export const FILE_TYPES = {
        PDF: "application/pdf",
        WORD: "application/msword",
        WORD_DOCX:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        EXCEL: "application/vnd.ms-excel",
        EXCEL_XLSX:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        JPEG: "image/jpeg",
        PNG: "image/png",
        GIF: "image/gif",
    };

    /**
     * Common allowed file types
     */
    export const ALLOWED_DOCUMENT_TYPES = [
        FILE_TYPES.PDF,
        FILE_TYPES.WORD,
        FILE_TYPES.WORD_DOCX,
        FILE_TYPES.EXCEL,
        FILE_TYPES.EXCEL_XLSX,
    ];

    export const ALLOWED_IMAGE_TYPES = [FILE_TYPES.JPEG, FILE_TYPES.PNG, FILE_TYPES.GIF];

    export const ALLOWED_ALL_TYPES = [
        ...ALLOWED_DOCUMENT_TYPES,
        ...ALLOWED_IMAGE_TYPES,
    ];
