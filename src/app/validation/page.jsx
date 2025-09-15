"use client";
import { DataTable } from "/src/components/ttable/index";
import dynamic from 'next/dynamic';
import { setCookie, getCookie, deleteCookie } from "cookies-next";
import  { useEffect } from 'react';
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useState ,useRef, useMemo} from "react";
//import { Editor } from 'react-draft-wysiwyg';
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import Modal from "react-modal";
const JoditEditor = dynamic(() => import('jodit-react'), { ssr: false });
//import JoditEditor from 'jodit-react';
import { useToast } from "/src/components/ui/use-toast"
import { useQuery } from "@tanstack/react-query";
import Dropdown from "/src/components/dropdown";
import { Button } from "/src/components/ui/button";
import { api, getDelegations, getUsers, getCurrentUser, getBene, getEtablissements,getArticles } from "/src/api";

import React from 'react';

import 'react-datepicker/dist/react-datepicker.css';


import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "/src/components/ui/dropdown-menu";
import { Switch } from "/src/components/ui/switch";

const Page = () => {
  const customStyless = {
    content: {
      margin: "auto",
      width: "50%",
      maxWidth: "500px", // Limite la largeur de la modal à 500px
      maxHeight: "80vh", // Limite la hauteur de la modal à 80% de la hauteur de la vue
      overflowY: "auto", // Ajoute une barre de défilement verticale si la modal dépasse la hauteur de la vue
    },
  };
  const [modalIsOpen, setIsOpen] = useState(false);
  const [modelDeleteIsOpen, setModelDeleteIsOpen] = useState(false);
  const [modelAttachmentIsOpen, setModelAttachmentIsOpen] = useState(false);
  const [value, setValue] = useState();
  //const Editor = React.lazy(() => import("react-draft-wysiwyg"));

  
  const { data: refetchh,} = useQuery({
    queryKey: ['delegations'],
    queryFn: getDelegations(),
  });
  const { data: eta,} = useQuery({
    queryKey: ['etablissements'],
    queryFn: getEtablissements(),
  });

  const { data: articles,refetch} = useQuery({
    queryKey: ['articles'],
    queryFn: getArticles(),
  });
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [selectedOptionss, setSelectedOptionss] = useState([]);
  const [comboBoxOpen, setComboBoxOpen] = useState(false);
  const [employeeData, setEmployeeData] = useState([]);
  const [typeOfSubmit, settypeOfSubmit] = useState("create");
  const token = getCookie('token'); 
  const headers = {
    Authorization: `Bearer ${token}`
  };
  const [selectedValue, setselectedValue] = useState({
    delegations: [],
  attachments:[],
  content: "" });
    // Initialisez la liste des parten
  
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ size: [] }],
      [{ font: [] }],
      [{ align: ["right", "center", "justify"] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      [{ color: ["red", "#785412"] }],
      [{ background: ["red", "#785412"] }]
    ]
  };

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "bullet",
    "link",
    "color",
    "image",
    "background",
    "align",
    "size",
    "font"
  ];

  const [code, setCode] = useState("hellllo");
  const handleProcedureContentChange = (content, delta, source, editor) => {
    setCode(content);
    //let has_attribues = delta.ops[1].attributes || "";
    //console.log(has_attribues);
    //const cursorPosition = e.quill.getSelection().index;
    // this.quill.insertText(cursorPosition, "★");
    //this.quill.setSelection(cursorPosition + 1);
  };
 //console.log(refetchh);
 function stripHtmlTags(html) {
  if (typeof window !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  }
  // Fallback for server-side rendering (Node.js environment)
  return html.replace(/<[^>]*>/g, ''); // This removes HTML tags as a fallback
}

  const delegationColumns = [
    {
      id: 'id',
      header: 'id',
      accessorKey: 'id',
      enableSorting: true,
      sortDescFirst: true,
    },
    {
      accessorKey: "title",
      id: "Titre",
      header: () => (
        <div className="text-left">Titre</div>
      ),
      cell: ({ row }) => (
        <div className="capitalize rtl:text-left">{row.original.title}</div>
      ),
    }
    ,
  
    {
      accessorKey: "content",
      header: () => (
        <div className="text-left">Contenu de l&apos;article</div>
      ),
      cell: ({ row }) => (
        <div className="rtl:text-left">{stripHtmlTags(row.getValue("content"))}</div>
      ),
    }
    ,
    {
      accessorKey: "corrige",
      header: () => (
        <div className="text-left">Contenu corrigé de l&apos;article</div>
      ),
      cell: ({ row }) => (
        <div className="rtl:text-left">{stripHtmlTags(row.getValue("corrige"))}</div>
      ),
    }
    ,
    {
      id: 'Type d\'activité',
      accessorKey: 'typeEvenet',
      header: () => (
        <div className="text-left">Type d&apos;activité</div>
      ),
      cell: ({ row }) => {
        return (
          <div className=" rtl:text-left">
            {row.original.typeEvenet}
          </div>
        );
      },
    },
    {
      accessorKey: "dateSoumission",
      id: 'dateSoumission',
      header: () => (
        <div className="text-left">Date de Soumission</div>
      ),
      cell: ({ row }) => (
        <div className="capitalize rtl:text-left">{row.original.dateSoumission}</div>
      ),
    }
    ,
    {
      accessorKey: "dateEvent",
      header: () => (
        <div className="text-left">Date de l&apos;événement</div>
      ),
      cell: ({ row }) => (
        <div className="capitalize rtl:text-left">{row.getValue("dateEvent")}</div>
      ),
    }
    ,
    {
      id: 'Délégations',
      header: () => (
        <div className="text-left">Délégation</div>
      ),
      accessorFn: (row) => row.delegations[0]?.delegation,
      cell: ({ row }) => (
        <div className="capitalize rtl:text-left">
          {row.original.delegations[0]?.delegation || 'Aucune délégation'}
        </div>
      ),
      filterFn: (row, columnId, filterValue) => {
        const delegation = row.getValue(columnId);
        return delegation?.toLowerCase().includes(filterValue.toLowerCase());
      },
    }
    ,
    {
      accessorKey: "etat",
      header: () => (
        <div className="text-left">Etat</div>
      ),
      cell: ({ row }) => (
        <div className="rtl:text-left">{row.getValue("etat")}</div>
      ),
    }
    ,
    {
      accessorKey: "observation",
      header: () => (
        <div className="text-left">Observation</div>
      ),
      cell: ({ row }) => (
        <div className="rtl:text-left">{row.getValue("observation")}</div>
      ),
    }
    ,
    
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const payment = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <DotsHorizontalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              <DropdownMenuItem
                onClick={() => {
                  //get selected row data
                  setselectedValue(row.original);
                  const partenaireId = row.original.id; // Récupération de l'ID de l'employé
   
    
                  setIsOpen(true);
                  settypeOfSubmit("update");
                  
                }}
              >
               Modéfier l&apos;état de l&apos;article
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  //get selected row data
                  setselectedValue(row.original);
                  const partenaireId = row.original.id; // Récupération de l'ID de l'employé
   
    
                  setIsOpen(true);
                  settypeOfSubmit("corrige");
                  
                }}
              >
               Corriger l&apos;article
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setselectedValue(row.original);
                 // console.log(selectedValue.id);
                  setModelAttachmentIsOpen(true);
                }}
              >
               Liste des Pièces jointes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];
  const { toast } = useToast()

  //use query to get data from the server
  const { data: bene } = useQuery({
    queryKey: ['Beneficiaire'],
    queryFn: getBene(),
  });
  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: getCurrentUser(),
  });
  function openModal() {
    setIsOpen(true);
  }
  //const [selectedFile, setSelectedFile] = useState(null);
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([])
  
  // Gérer la sélection de fichier
  const formData = new FormData();
  const attachments = new FormData();
  /*const handleFileChange = (event) => {
    const selectedFile = event.target.files[0]; // Obtenir le fichier sélectionné à partir de l'événement
  
  // Mettre à jour l'état local du fichier
        setFile(selectedFile);
         
  // Ajouter le fichier sélectionné à l'objet FormData
        formData.append('file', selectedFile);
    
   
  };*/
  const handleFileChange = (event) => {
    const selectedFiles = event.target.files; // Get the selected files from the event

    // Update the local state with the selected files
    setFiles(Array.from(selectedFiles));
  };
 
 
  useEffect(() => {
    if (selectedValue && selectedValue.delegations && selectedValue.delegations.length > 0) {
      setSelectedOptions(selectedValue.delegations.map(delegation => ({
        value: delegation.id.toString(),
        label: delegation.delegation,
      })));
    }
  }, [selectedValue]);

 /* useEffect(() => {
    if (selectedValue && selectedValue.etablissement) {
      setSelectedOptionss([
        {
          value: selectedValue.etablissement,
          label: selectedValue.etablissement,
        }
      ]);
    }
  }, [selectedValue]);*/
  const handleSelect = (selectedOptions) => {
    setSelectedOptions(selectedOptions);
    console.log([parseFloat(selectedOptions.value)]);
    // Autres manipulations si nécessaire
  };
  
  
  
  //console.log(articles);
  function closeModal() {
    setIsOpen(false);
  }


  const [localDate, setLocalDate] = useState('');

  useEffect(() => {
    // Obtenir la date actuelle
    const currentDate = new Date();

    // Obtenir les composants de la date
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const day = currentDate.getDate().toString().padStart(2, '0');

    // Format de la date locale (par exemple : YYYY-MM-DD)
    const localDateString = `${day}/${month}/${year}`;

    // Mettre à jour l'état avec la date locale
    setLocalDate(localDateString);
  }, []);
  const [filteredData, setFilteredData] = useState([]);
  
  useEffect(() => {
    // Filtrer les données en fonction du rôle de l'utilisateur lorsqu'il change
    const filtered = filterDataByRole(articles || [], userData);
    setFilteredData(filtered);
  }, [articles, userData]);
  const filterDataByRole = (articles, userData) => {
    if (userData?.roles === "DELEGUE_ROLES") {
      // Filtrer les données où la colonne "delegation" est égale à "user.delegation"
      return articles.filter(item => item.delegations?.delegation?.trim() === userData.delegation.trim());
    }  else {
      // Si le rôle de l'utilisateur n'est pas défini, retourner toutes les données
      return bene;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (typeOfSubmit === "create") {
      files.forEach((file, index) => {
        
        formData.append('files', file);
        attachments.append('files', file);
      });
      try {
        const parsedSelectedValue = {
          ...selectedValue,
          title: selectedValue.title,
         idDelegations: [parseFloat(selectedOptions.value)],
        
         content: selectedValue.content,
         dateSoumission: localDate,
         id: parseFloat(selectedValue.id), // Si som est un nombre à virgule flottante
         //idDelegations: [selectedValue.delegations],
         //attachments: [formData]        
          
          
        };
        //formData.append('article', parsedSelectedValue);
       console.log('Données envoyées au serveur:', {request:parsedSelectedValue, attachments :formData}); 
      const response = await api.post("/article/create",parsedSelectedValue, 
        {headers: {
          ...headers,
   
      }
              }
         
       )
        openModal()
        refetch()
        toast({
          description: "Article créé avec succès",
          className: "bg-green-500 text-white",
          duration: 2000,
          title: "Success",
        })
        setIsOpen(false);
      } catch (e) {
        toast({
          description: "Erreur lors de la création d'un nouveau article",
          className: "bg-red-500 text-white",
          duration: 2000,
          title: "Error",
        })
      }
    
        
    
    }
    else if (typeOfSubmit === "update" ) {
      try {
        const parsedSelectedValue = {
          ...selectedValue,
          /*delegation: userData.delegation,
         // idDelegations:  userData?.roles === "DELEGUE_ROLES"  ? [idDelegation]: selectedOptions.map(option => parseInt(option.value)),
          nom: selectedValue.nom,
          etablissement: selectedOptionss.label || selectedValue.etablissement,
          id: parseFloat(selectedValue.id), // Si som est un nombre à virgule flottante
          etat: selectedValue.etat,
          coordination: userData.coordination,
          sexe: selectedValue.sexe,
          handicap: selectedValue.handicap,
          email: selectedValue.email,*/
          title: selectedValue.title,
          // idDelegations:  userData?.roles === "DELEGUE_ROLES"  ? [idDelegation]: selectedOptions.map(option => parseInt(option.value)),
          content: selectedValue.content,
          dateSoumission: selectedValue.dateSoumission,
          id: parseFloat(selectedValue.id), // Si som est un nombre à virgule flottante
          idDelegations: [parseFloat(selectedOptions.value)],
          attachments: selectedValue.attachments,
          etat: selectedValue.etat,
          corrige:selectedValue.corrige,
          observation: selectedValue.observation
        };
        
        console.log('Données envoyées au serveur:', parsedSelectedValue);
       // console.log(selectedValue);
        const response = await api.put("/article/update/"+ selectedValue.id, 
        parsedSelectedValue,  {headers: {
            ...headers,
     
        }
                })
          
        
        refetch()
        toast({
          description: "Article mis à jour avec succès",
          className: "bg-green-500 text-white",
          duration: 2000,
          title: "Success",
        })
        setIsOpen(false);
      } catch (e) {
        toast({
          description: "Erreur lors de la mise à jour de l'article",
          className: "bg-red-500 text-white",
          duration: 2000,
          title: "Error",
        })
      }
    }
  


    else if (typeOfSubmit === "corrige" ) {
        try {
          const parsedSelectedValue = {
            ...selectedValue,
            /*delegation: userData.delegation,
           // idDelegations:  userData?.roles === "DELEGUE_ROLES"  ? [idDelegation]: selectedOptions.map(option => parseInt(option.value)),
            nom: selectedValue.nom,
            etablissement: selectedOptionss.label || selectedValue.etablissement,
            id: parseFloat(selectedValue.id), // Si som est un nombre à virgule flottante
            etat: selectedValue.etat,
            coordination: userData.coordination,
            sexe: selectedValue.sexe,
            handicap: selectedValue.handicap,
            email: selectedValue.email,*/
            title: selectedValue.title,
            // idDelegations:  userData?.roles === "DELEGUE_ROLES"  ? [idDelegation]: selectedOptions.map(option => parseInt(option.value)),
            content: selectedValue.content,
            dateSoumission: selectedValue.dateSoumission,
            id: parseFloat(selectedValue.id), // Si som est un nombre à virgule flottante
            idDelegations: [parseFloat(selectedOptions.value)],
            attachments: selectedValue.attachments,
            etat: selectedValue.etat
            
          };
          
          console.log('Données envoyées au serveur:', parsedSelectedValue);
         // console.log(selectedValue);
          const response = await api.put("/article/update/"+ selectedValue.id, 
          parsedSelectedValue,  {headers: {
              ...headers,
       
          }
                  })
            
          
          refetch()
          toast({
            description: "Article mis à jour avec succès",
            className: "bg-green-500 text-white",
            duration: 2000,
            title: "Success",
          })
          setIsOpen(false);
        } catch (e) {
          toast({
            description: "Erreur lors de la mise à jour de l'article",
            className: "bg-red-500 text-white",
            duration: 2000,
            title: "Error",
          })
        }
      }
  }
  const editor = useRef(null);
	  const [content, setContent] = useState('');
      const[corrige,setCorrige]=useState('');

	
  return (
    <div className="px-10 py-4" id="Articles">
      <DeleteModal
        closeModal={() => setModelDeleteIsOpen(false)}
        modalIsOpen={modelDeleteIsOpen}
        selectedValue={selectedValue}
        refetch={refetch}
        toast={toast}
      />
      <AttachmentModal
       
       isOpen={modelAttachmentIsOpen}
       closeModal={() => setModelAttachmentIsOpen(false)}
       selectedValue={selectedValue}
       refetch={refetch}
       toast={toast}
       idarticle ={selectedValue.id} 
     />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        style={customStyless}
        contentLabel="Example Modal"
      >
        <form className="max-w-lg mx-auto py-8 bg-white shadow-md rounded-md" onSubmit={handleSubmit}>
          <h2 className="text-lg font-semibold mb-4 px-6 text-center">
            {typeOfSubmit === "corrige"
              ? "Corriger l'article"
              : "Modéfier l'état de l'article actuel"}
          </h2>
          {/*<div className="px-6 mb-4 flex flex-col w-full">
              <label className="block mb-1" htmlFor="delegation">
                    Délégation
               </label>
   
              <Select
          options={(refetchh || []).map(item => ({
            value: item.id.toString(),
            label: item.delegation,
          }))}
          value={selectedOptions}
          onChange={handleSelect}
          placeholder="Sélectionner une délégation"
          readonly
             />
        </div>
          <div className=" px-6  mb-4">
            <label className="block mb-1" for="title">
            Titre de l'article
            </label>
           
          <input
             className="w-full border rounded-md px-3 py-2"
             type="text"
              id="title"
             placeholder="Titre"
             readonly
             value={selectedValue?.title || " "}
             onChange={(e) => {
                setselectedValue({
                  ...selectedValue,
                  title: e.target.value,
                });}}
             />
        
              </div>


          


          <div className="px-6 mb-4">
  <label className="block mb-1" htmlFor="content">
    Contenu de l'article
  </label>
  <JoditEditor
			ref={editor}
            readonly
			value={selectedValue.content || content}
			placeholder="Titre"
			tabIndex={1} // tabIndex of textarea
			onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
			onChange={(newContent) => {
        if (selectedValue) {
            setselectedValue({
                ...selectedValue,
                content: newContent,
            });
        }
    }}
		/>
 
</div>


{/*<div className="px-6 mb-4">
      <label className="block mb-1" htmlFor="attachments">
        Pièces jointes
      </label>
      <input
        className="w-full border rounded-md px-3 py-2"
        type="file"
        id="attachments"
        onChange={handleFileChange}
        multiple  
      />
     
    </div>
          <div>
      <input type="file" multiple onChange={handleFileChange} />
      {/* Optionally, display the names of the selected files 
      {files.length > 0 && (
        <ul>
          {files.map((file, index) => (
            <li key={index}>{file.name}</li>
          ))}
        </ul>
      )}
   
    </div> */}
     {typeOfSubmit === "update"? (
           <div className=" px-6  mb-16 mt-8">
           <label className="block mb-1" htmlFor="etat">
               Etat
           </label>
            <DropdownMenu>
               <DropdownMenuTrigger>
                  <button className="w-full border rounded-md px-3 py-2 text-left">
                     {selectedValue?.etat}
                  </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="origin-top-right right-0">
              <DropdownMenuItem onSelect={(e) => {
                       setselectedValue({
                        ...selectedValue,
                        etat: e.target.textContent,
                             });
                        }}>
                        En cours de traitement
                   </DropdownMenuItem>
                   <DropdownMenuItem onSelect={(e) => {
                       setselectedValue({
                        ...selectedValue,
                        etat: e.target.textContent,
                             });
                        }}>
                        En cours de validation
                   </DropdownMenuItem>
                   <DropdownMenuItem onSelect={(e) => {
                      setselectedValue({
                     ...selectedValue,
                     etat: e.target.textContent,
                          });
                            }}>
                             Validé
                   </DropdownMenuItem>
                  
                   <DropdownMenuItem onSelect={(e) => {
                      setselectedValue({
                     ...selectedValue,
                     etat: e.target.textContent,
                          });
                            }}>
                            Non validé
                   </DropdownMenuItem>
                </DropdownMenuContent>
          </DropdownMenu>
          <label className="block mb-1 mt-8" htmlFor="observation">
               Observation
           </label>
           <textarea
  className="w-full border rounded-md px-3 py-2"
  id="observation"
  placeholder="Observation"
  value={selectedValue?.observation || ""}
  onChange={(e) => {
    setselectedValue({
      ...selectedValue,
      observation: e.target.value,
    });
  }}
/>
          </div>)
          :(
            <div className="px-6 mb-4">
  <label className="block mb-1" htmlFor="content">
    Contenu de l&apos;article
  </label>
  <textarea
  className="block w-full px-4 py-2 mb-8 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  value={stripHtmlTags(selectedValue.content) || stripHtmlTags(content)}
  placeholder="Titre"
  onChange={(e) => {
    if (selectedValue) {
      setselectedValue({
        ...selectedValue,
        content: e.target.value,
      });
    }
  }}
  style={{ minHeight: "200px", resize: "none" }}
  readOnly={true}
/>
 
<label className="block mb-1" htmlFor="content">
    Contenu corrigé de l&apos;article
  </label>


 <JoditEditor
			ref={editor}
			value={selectedValue.corrige || corrige}
			placeholder="Titre"
			tabIndex={1} // tabIndex of textarea
			onBlur={newContent => setContent(newContent)} // preferred to use only this option to update the content for performance reasons
			onChange={(newContent) => {
        if (selectedValue) {
            setselectedValue({
                ...selectedValue,
                corrige: newContent,
            });
        }
    }}
    
		/>
        </div>

  

          )}

          <div className="mt-4 px-6 flex justify-end">
          <button className="bg-gray-500 text-white px-4 py-2 rounded-md">
              Envoyer
            </button>
          </div>
        </form>
      </Modal>
      <DataTable
        title={"Validation d'articles"}
        filterCols={['Titre', 'dateSoumission', 'Type d\'activité', 'Délégations']}
        columns={delegationColumns}
        data={articles || []}
        setOpenModal={openModal}
        settypeOfSubmit={settypeOfSubmit}
        canAdd={true}
      />
    </div>
  );
};

export default Page;

const AttachmentModal = ({ isOpen, closeModal, selectedValue, refetch, toast, idarticle }) => {
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      padding: "0",
      width: "fit-content",
    },
  };
  const [files, setFiles] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [imageUrls, setImageUrls] = useState({});

  useEffect(() => {
    if (isOpen) {
      loadAttachments();
    }
  }, [isOpen]);

  const loadAttachments = async () => {
    const token = getCookie('token');
    try {
      const response = await api.get(`http://localhost:8080/attachments/by-article/${idarticle}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const attachments = response.data;
      setAttachments(attachments);
      await loadImageUrls(attachments, token);
    } catch (error) {
      console.error('Error loading pieces jointes:', error);
    }
  };

  const loadImageUrls = async (attachments, token) => {
    const urls = {};
    for (const attachment of attachments) {
      if (attachment.fileType.startsWith('image/')) {
        const response = await fetch(`http://localhost:8080/attachments/download/${attachment.id}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const blob = await response.blob();
        urls[attachment.id] = URL.createObjectURL(blob);
      }
    }
    setImageUrls(urls);
  };

  const handleDownloadClick = async (e, fileId, fileName) => {
    e.preventDefault();

    try {
      const token = getCookie('token');
      const response = await fetch(`http://localhost:8080/attachments/download/${fileId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier :', error);
    }
  };

  const handleFileChange = (event) => {
    const selectedFiles = event.target.files;
    setFiles(Array.from(selectedFiles));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    try {
      const response = await api.put(`/attachments/create/${parseFloat(idarticle)}`, formData, {
        headers: {
          Authorization: `Bearer ${getCookie('token')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        description: 'Pièces jointes ajoutées avec succès',
        className: 'bg-green-500 text-white',
        duration: 2000,
        title: 'Success',
      });

      refetch();
      closeModal();
    } catch (error) {
      toast({
        description: 'Erreur lors de l\'ajout des pièces jointes',
        className: 'bg-red-500 text-white',
        duration: 2000,
        title: 'Error',
      });

      console.error('Error adding attachments:', error);
    }
  };

  const renderIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <i className="fas fa-file-image" style={styles.fileIcon}></i>;
    }
    return <i className="fas fa-file-alt" style={styles.fileIcon}></i>;
  };
  const handleDeleteClick = async (e, fileId) => {
    e.preventDefault();

    try {
      const token = getCookie('token');
      const response = await api.delete(`http://localhost:8080/attachments/delete/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      

      // Rafraîchir les données après la suppression
      refetch();
      setAttachments(attachments.filter(attachment => attachment.id !== fileId));
      toast({
        description: 'Pièce jointe supprimée avec succès',
        className: 'bg-green-500 text-white',
        duration: 2000,
        title: 'Success',
      });
    } catch (error) {
      

      toast({
        description: 'Erreur lors de la suppression de la pièce jointe',
        className: 'bg-red-500 text-white',
        duration: 2000,
        title: 'Error',
      });
    }
  };

  

  return (
    <Modal isOpen={isOpen} onRequestClose={closeModal} style={customStyles}>
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Gestion des pièces jointes</h2>
        </div>
        
        <div className="p-6">


          <h3 className="text-lg font-semibold mb-4 text-gray-700">Liste des pièces jointes</h3>
          
          <div className="mt-4 max-h-[50vh] overflow-y-auto">
            {attachments.length === 0 ? (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
                <p>Aucune pièce jointe n&apos;a été ajoutée pour le moment.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {attachments.map(attachment => (
                  <li key={attachment.id} className="bg-gray-50 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between">
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                      {attachment.fileType.startsWith('image/') ? (
                        <img
                          src={imageUrls[attachment.id]}
                          alt={attachment.fileName}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : attachment.fileType.startsWith('video/') ? (
                        <video className="w-12 h-12 object-cover rounded">
                          <source src={imageUrls[attachment.id]} type={attachment.fileType} />
                        </video>
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                      <span className="font-medium text-gray-700">{attachment.fileName}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => handleDownloadClick(e, attachment.id, attachment.fileName)}
                        className="bg-blue-900 hover:bg-blue-900 text-white py-1 px-3 rounded text-sm transition duration-200"
                      >
                        Télécharger
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(e, attachment.id)}
                        className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm transition duration-200"
                      >
                        Supprimer
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};


const customStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    padding: '0',
    width: '90%',
    maxWidth: '800px',
    maxHeight: '90vh',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
};




const styles = {
  attachmentList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  attachmentItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px',
    borderBottom: '1px solid #ccc',
  },
  imagePreview: {
    maxWidth: '70px',
    maxHeight: '70px',
    marginRight: '10px',
    borderRadius: '4px',
  },
  fileIcon: {
    fontSize: '24px',
    marginRight: '10px',
  },
  fileName: {
    flexGrow: 1,
  },
  downloadLink: {
    textDecoration: 'none',
    color: '#7a7a7a',
    cursor: 'pointer',
    margin: '0 40px',
  },
  downloadLinkHover: {
    textDecoration: 'underline',
  },
  tableHeader: {
    backgroundColor: '#ccc',
    color: '#333',
    padding: '10px',
    textAlign: 'center',
  },
  space: {
    margin: '0 40px', // Ajout d'un espace de 10 pixels entre les deux liens
  },
};




const DeleteModal = ({ modalIsOpen, afterOpenModal, closeModal, selectedValue, refetch, toast }) => {
  const customStyles = {
    content: {
      top: "50%",
      left: "50%",
      right: "auto",
      bottom: "auto",
      marginRight: "-50%",
      transform: "translate(-50%, -50%)",
      padding: "0",
      width: "fit-content",
    },
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = getCookie('token'); 
    const headers = {
        Authorization: `Bearer ${token}`
    };
    try {
      await api.delete("/article/delete/" + selectedValue.id,{
        headers: headers
             
            } )
      toast({
        description: "Supprimé avec succès",
        className: "bg-green-500 text-white",
        duration: 2000,
        title: "Success",
      })
      refetch()
      closeModal()
    } catch (e) {
      toast({
        description: "Erreur lors de la suppression de l'article",
        className: "bg-red-500 text-white",
        duration: 2000,
        title: "Error",
      })
      console.log(e);
    }
  }



  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      
      contentLabel="Example Modal"
    >
      <form className="max-w-md mx-auto p-6 bg-white shadow-md rounded-md" onSubmit={handleSubmit}>
        <h2 className="text-lg font-semibold mb-4">Supprimer</h2>
        <div className="mb-4">
          <p>Êtes-vous sûr de vouloir supprimer cet élément ?</p>
        </div>
        <div className="flex justify-between">
          <button
            type="button"
            onClick={closeModal}
            className="bg-gray-500 text-white px-4 py-2 rounded-md">
          
            Annuler
          </button>
          <button
            type="submit"
            className="bg-gray-500 text-white px-4 py-2 rounded-md">
          
            Supprimer
          </button>
        </div>
      </form>
    </Modal>
  );



  
};


