"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import { fetchContacts, createContact, updateContact, deleteContact } from "@/lib/contacts";
import { Plus, PencilSimple, Trash, User, Phone, EnvelopeSimple, X } from "@phosphor-icons/react";

export default function ContactsPage() {
  const { user, loading, session } = useAuthStore();
  const [contacts, setContacts] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [resolvedToken, setResolvedToken] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", resourceName: "", etag: "" });

  useEffect(() => {
    async function initToken() {
      if (session?.providerAccessToken) {
        setResolvedToken(session.providerAccessToken);
      } else if (user && session?.provider !== 'google') {
        try {
          const { checkComposioStatus, getComposioAccessToken } = await import("@/app/composioActions");
          const status = await checkComposioStatus(user.$id);
          if (status.connected) {
            const compData = await getComposioAccessToken(user.$id);
            if (compData.connectionId) {
              setResolvedToken(compData.connectionId);
            }
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    initToken();
  }, [session, user]);

  useEffect(() => {
    if (!loading && user && resolvedToken) {
      loadContacts(resolvedToken);
    }
  }, [loading, user, resolvedToken]);

  const loadContacts = async (token) => {
    setIsLoadingContacts(true);
    try {
      const data = await fetchContacts(token);
      setContacts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingContacts(false);
    }
  };

  const handleOpenModal = (contact = null) => {
    if (contact) {
      setEditingContact(contact);
      setFormData({
        name: contact.names?.[0]?.givenName || "",
        email: contact.emailAddresses?.[0]?.value || "",
        phone: contact.phoneNumbers?.[0]?.value || "",
        resourceName: contact.resourceName,
        etag: contact.etag,
      });
    } else {
      setEditingContact(null);
      setFormData({ name: "", email: "", phone: "", resourceName: "", etag: "" });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingContact(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingContact) {
      await updateContact(resolvedToken, formData.resourceName, formData);
    } else {
      await createContact(resolvedToken, formData);
    }
    handleCloseModal();
    loadContacts(resolvedToken);
  };

  const handleDelete = async (resourceName) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      await deleteContact(resolvedToken, resourceName);
      loadContacts(resolvedToken);
    }
  };

  if (loading || isLoadingContacts) {
    return (
      <div className="flex h-full items-center justify-center bg-[#eceae6]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-gray-800"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#eceae6] relative">
      <div className="px-8 py-6 border-b border-gray-200/50 bg-[#eceae6] flex justify-between items-center shrink-0 z-10 sticky top-0">
        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Contacts</h1>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#2b323b] hover:bg-[#3d4651] text-[#eceae6] px-4 py-2 rounded-xl transition shadow-sm font-medium"
        >
          <Plus size={18} weight="bold" />
          <span>Add Contact</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
            <User size={64} weight="light" className="opacity-50" />
            <p className="text-lg">No contacts found.</p>
            <button 
              onClick={() => handleOpenModal()}
              className="text-[#50686c] hover:text-[#2b323b] font-medium transition"
            >
              Create your first contact
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {contacts.map((contact) => (
              <div 
                key={contact.resourceName}
                className="bg-white/60 hover:bg-white backdrop-blur-sm p-5 rounded-2xl border border-gray-200/50 shadow-sm hover:shadow-md transition group relative overflow-hidden flex flex-col"
              >
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition flex items-center gap-1">
                  <button 
                    onClick={() => handleOpenModal(contact)}
                    className="p-1.5 text-gray-400 hover:text-[#2b323b] hover:bg-gray-100 rounded-md transition"
                    title="Edit"
                  >
                    <PencilSimple size={16} weight="bold" />
                  </button>
                  <button 
                    onClick={() => handleDelete(contact.resourceName)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition"
                    title="Delete"
                  >
                    <Trash size={16} weight="bold" />
                  </button>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-[#c7d4ce] flex items-center justify-center text-[#2b323b] font-semibold text-lg shrink-0">
                    {contact.names?.[0]?.givenName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-semibold text-gray-800 text-lg truncate">
                      {contact.names?.[0]?.givenName || "Unknown"}
                    </h3>
                  </div>
                </div>

                <div className="space-y-2 mt-auto">
                  {contact.emailAddresses?.[0]?.value && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <EnvelopeSimple size={16} className="text-gray-400 shrink-0" />
                      <span className="truncate">{contact.emailAddresses[0].value}</span>
                    </div>
                  )}
                  {contact.phoneNumbers?.[0]?.value && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={16} className="text-gray-400 shrink-0" />
                      <span className="truncate">{contact.phoneNumbers[0].value}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-[#2b323b]/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-[#eceae6] w-full max-w-md rounded-2xl shadow-2xl border border-[#d0cfcb] overflow-hidden flex flex-col transform animate-in slide-in-from-bottom-4 duration-300">
            <div className="px-6 py-5 border-b border-[#dddcdc] flex justify-between items-center">
              <h2 className="text-[16px] font-medium text-[#2b323b]">
                {editingContact ? "Edit Contact" : "Add New Contact"}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 rounded-md transition"
              >
                <X size={18} weight="bold" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-[13px] font-medium text-gray-800 mb-2">Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" weight="bold" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-transparent border border-[#dddcdc] rounded-lg focus:outline-none focus:border-gray-400 transition text-[14px] text-[#2b323b] placeholder-gray-400"
                    placeholder="Jane Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-800 mb-2">Email Address</label>
                <div className="relative">
                  <EnvelopeSimple size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" weight="bold" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-transparent border border-[#dddcdc] rounded-lg focus:outline-none focus:border-gray-400 transition text-[14px] text-[#2b323b] placeholder-gray-400"
                    placeholder="jane@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-medium text-gray-800 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" weight="bold" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-transparent border border-[#dddcdc] rounded-lg focus:outline-none focus:border-gray-400 transition text-[14px] text-[#2b323b] placeholder-gray-400"
                    placeholder="+1 (234) 567-8900"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-transparent border border-[#dddcdc] text-gray-700 hover:bg-gray-100 rounded-lg text-[14px] font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#2b323b] hover:bg-[#3d4651] text-[#eceae6] rounded-lg text-[14px] font-medium transition shadow-sm"
                >
                  {editingContact ? "Save Changes" : "Add Contact"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
