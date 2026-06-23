
  let options = [];
  if (mode === "search") {
    if (!input.trim()) {
      options.push({ type: 'nav', label: 'Compose message', href: '/inbox/compose' });
      options.push({ type: 'nav', label: 'Go to inbox', href: '/inbox' });
      if (currentEmailId) {
        options.push({ type: 'action', label: 'Mark thread done', actionType: 'done' });
      }
      savedChats.slice(0, 5).forEach(chat => {
        options.push({ type: 'ai_chat', chat, label: chat.title });
      });
    } else {
      const q = input.trim().toLowerCase();
      
      const addNav = (label, href) => {
        if (label.toLowerCase().includes(q)) options.push({ type: 'nav', label, href });
      };
      
      const addAction = (label, actionType) => {
        if (label.toLowerCase().includes(q)) options.push({ type: 'action', label, actionType });
      };

      if ("search settings".includes(q)) {
        options.push({ type: 'settings', label: 'Search Settings' });
      }
      if ("settings".includes(q)) {
        options.push({ type: 'settings', label: 'Settings' });
      }

      addNav("Compose message", "/inbox/compose");
      addNav("Go to inbox", "/inbox");
      addNav("Go to starred", "/inbox?filter=starred");
      addNav("Go to sent", "/inbox?filter=sent");
      addNav("Go to drafts", "/inbox?filter=drafts");
      addNav("Go to done", "/inbox?filter=done");
      addNav("Go to spam", "/inbox?filter=spam");
      addNav("Go to trash", "/inbox?filter=trash");

      if (currentEmailId) {
        addAction("Mark thread done", "done");
        addAction("Star thread", "star");
        addAction("Block sender", "block_sender");
        addAction("Block domain", "block_domain");
        addAction("Mark thread trash", "trash");
        addAction("Mark thread spam", "spam");
      }
      
      options.push({ type: 'search_emails', label: `Search emails for "${input}"` });

      const matchedChats = savedChats.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.messages?.some(m => m.content?.toLowerCase().includes(q))
      );
      matchedChats.slice(0, 5).forEach(chat => {
        options.push({ type: 'ai_chat', chat, label: chat.title });
      });
    }
  } else if (mode === "ai" && chatHistory.length === 0 && !input.trim()) {
    savedChats.forEach(chat => {
      options.push({ type: 'ai_chat', chat, label: chat.title });
    });
  }

  const executeOption = async (option) => {
    if (option.type === 'search_emails') {
      router.push(`/inbox?search=${encodeURIComponent(input.trim())}`);
      closeCommandPalette();
    } else if (option.type === 'settings') {
      router.push(`/inbox/settings`);
      closeCommandPalette();
    } else if (option.type === 'nav') {
      router.push(option.href);
      closeCommandPalette();
    } else if (option.type === 'action') {
      setIsLoading(true);
      const { trashEmail, doneEmail, starEmail, spamEmail } = await import("@/lib/gmail");
      
      if (option.actionType === 'trash') {
        await trashEmail(resolvedToken, currentEmailId);
        router.push("/inbox");
      } else if (option.actionType === 'done') {
        await doneEmail(resolvedToken, currentEmailId);
        router.push("/inbox");
      } else if (option.actionType === 'star') {
        await starEmail(resolvedToken, currentEmailId);
      } else if (option.actionType === 'spam') {
        await spamEmail(resolvedToken, currentEmailId);
        router.push("/inbox");
      } else {
        console.log("Mocked action:", option.actionType);
      }
      setIsLoading(false);
      closeCommandPalette();
    } else if (option.type === 'ai_chat') {
      if (chatHistory.length > 0) saveCurrentChat();
      loadChat(option.chat.id);
      setMode("ai");
      setInput("");
    }
  };

  const handleSubmit = async () => {
    if (!input.trim()) return;
    
    if (mode === "search") {
      // Regular search: navigate to inbox with search query
      router.push(`/inbox?search=${encodeURIComponent(input.trim())}`);
      closeCommandPalette();
      return;
    }

    // AI mode
    if (isLoading) return;
    const userMessage = { role: "user", content: input };
    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      let context = "";
      if (user?.name) {
        context += `Name: ${user.name}. `;
      }
      if (user?.prefs) {
        context += `Job Title: ${user.prefs.jobName || 'Unknown'}, Company: ${user.prefs.company || 'Unknown'}. `;
        if (user.prefs.writingStyle) {
          context += `Writing Style: ${user.prefs.writingStyle}`;
        }
      }
      
      try {
        const { incrementAiUsage } = await import("@/lib/usage");
        await incrementAiUsage(user, checkAuth);
      } catch (usageError) {
        setChatHistory([...newHistory, { role: "assistant", content: `Error: ${usageError.message}` }]);
        setIsLoading(false);
        return;
      }
      
      const responseContent = await chatWithAiAction(newHistory, resolvedToken, context);
      setChatHistory([...newHistory, { role: "assistant", content: responseContent }]);
    } catch (error) {
      setChatHistory([...newHistory, { role: "assistant", content: "Sorry, I encountered an error." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    const isShowingOptions = mode === "search" || (mode === "ai" && chatHistory.length === 0 && !input.trim());
    
    if (isShowingOptions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, options.length - 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (options[selectedIndex]) {
          executeOption(options[selectedIndex]);
        } else if (input.trim() && mode === "search") {
          router.push(`/inbox?search=${encodeURIComponent(input.trim())}`);
          closeCommandPalette();
        }
        return;
      }
      if (e.key === 'Tab' && mode === "search") {
        e.preventDefault();
        setMode("ai");
        return;
      }
    } else {
      if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault();
        handleSubmit();
        return;
      }
    }
  };

  const handleBack = () => {
    if (chatHistory.length > 0) {
      clearChat();
    }
    setMode("search");
    setInput("");
  };

  // Custom renderer to turn email references into clickable links and render draft emails
  const renderAiContent = (content, msgIdx) => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children, ...props }) => {
            // Check if it's an internal email link
            if (href && href.startsWith("/inbox/email/")) {
              return (
                <button
                  onClick={() => {
                    closeCommandPalette();
                    router.push(href);
                  }}
                  className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1 cursor-pointer bg-transparent border-none p-0 m-0 text-inherit font-inherit"
                >
                  <Envelope size={14} className="inline" />
                  {children}
                </button>
              );
            }
            return <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline" {...props}>{children}</a>;
          },
          pre: ({ node, children, ...props }) => {
            // Check if the pre contains our draft-email
            const hasDraft = node.children && node.children.some(child => 
              child.tagName === 'code' && child.properties?.className?.includes('language-draft-email')
            );
            if (hasDraft) {
              return <div className="not-prose my-2">{children}</div>;
            }
            return <pre {...props}>{children}</pre>;
          },
          code: ({ node, inline, className, children, ...props }) => {
            const match = /language-([\w-]+)/.exec(className || '');
            if (!inline && match && match[1] === 'draft-email') {
              try {
                const draftData = JSON.parse(String(children).replace(/\n$/, ''));
                return (
                  <AiComposeBox
                    initialTo={draftData.to}
                    initialSubject={draftData.subject}
                    initialBody={draftData.body}
                    resolvedToken={resolvedToken}
                    onDiscard={() => {
                      const updatedHistory = [...chatHistory];
                      const msg = updatedHistory[msgIdx];
                      msg.content = msg.content.replace(new RegExp(`\`\`\`draft-email[\\s\\S]*?\`\`\``), "_Draft discarded._");
                      setChatHistory(updatedHistory);
                    }}
                    onSent={(to) => {
                      const updatedHistory = [...chatHistory];
                      const msg = updatedHistory[msgIdx];
                      msg.content = msg.content.replace(new RegExp(`\`\`\`draft-email[\\s\\S]*?\`\`\``), `**Γ£à Email sent successfully to ${to}!**`);
                      setChatHistory(updatedHistory);
                    }}
                  />
                );
              } catch (e) {
                return <code className={className} {...props}>{children}</code>;
              }
            }
            return <code className={className} {...props}>{children}</code>;
          }
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

