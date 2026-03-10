import { useEffect, useMemo, useState } from "react";
import TicketDetailPane from "../components/tickets/TicketDetailPane";
import TicketsFiltersSidebar from "../components/tickets/TicketsFiltersSidebar";
import TicketsListPane from "../components/tickets/TicketsListPane";
import { useAppShell } from "../contexts/AppShellContext";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { usePortalData } from "../features/portal/usePortalData";
import { filterTickets } from "../features/tickets/ticketUtils";

function TicketsPage() {
  const { language, copy, searchQuery, setSearchQuery } = useAppShell();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const { tickets, branches, loading, error, saveReply, saveCustomerResolution, markReplied, closeTicket } = usePortalData(language);
  const [filters, setFilters] = useState({ status: "all", priority: "all", branch: "all" });
  const branchOptions = useMemo(() => branches.map((branch) => branch.branch_name), [branches]);
  const [selectedId, setSelectedId] = useState(null);
  const [busy, setBusy] = useState(false);

  const filteredTickets = useMemo(() => filterTickets(tickets, { ...filters, search: searchQuery }), [tickets, filters, searchQuery]);
  useEffect(() => {
    if (!selectedId && filteredTickets[0]?.rowId) setSelectedId(filteredTickets[0].rowId);
    if (selectedId && !tickets.find((ticket) => ticket.rowId === selectedId)) setSelectedId(filteredTickets[0]?.rowId || tickets[0]?.rowId || null);
  }, [filteredTickets, selectedId, tickets]);

  const selectedTicket = useMemo(() => {
    const fallback = filteredTickets[0]?.rowId || tickets[0]?.rowId || null;
    const finalId = selectedId && tickets.find((ticket) => ticket.rowId === selectedId) ? selectedId : fallback;
    return tickets.find((ticket) => ticket.rowId === finalId) || null;
  }, [filteredTickets, selectedId, tickets]);

  const handleAction = async (action, successMessage) => {
    if (!selectedTicket?.rowId) return;
    setBusy(true);
    try {
      await action(selectedTicket.rowId);
      if (successMessage) showToast(copy.ticketsInboxTitle, successMessage, "good");
    } catch (actionError) {
      showToast(copy.ticketLoadError, actionError?.message || copy.ticketLoadError, "bad");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tickets-page-grid">
      <TicketsFiltersSidebar
        copy={copy}
        filters={{ ...filters, search: searchQuery }}
        branchOptions={branchOptions}
        resultCount={filteredTickets.length}
        onChange={(key, value) => {
          if (key === "search") {
            setSearchQuery(value);
            return;
          }
          setFilters((current) => ({ ...current, [key]: value }));
        }}
      />
      <TicketsListPane copy={copy} tickets={filteredTickets} selectedId={selectedTicket?.rowId} onSelect={setSelectedId} />
      <TicketDetailPane
        key={selectedTicket?.rowId || "empty"}
        copy={copy}
        ticket={selectedTicket}
        handledByDefault={profile?.name || profile?.email || ""}
        busy={busy || loading}
        onSaveReply={async (_ticketId, replyText) => {
          if (!selectedTicket?.rowId) return;
          if (!replyText.trim()) {
            showToast(copy.branchReplyTitle, copy.writeReplyFirst, "bad");
            return;
          }
          setBusy(true);
          try {
            await saveReply(selectedTicket.rowId, replyText.trim());
            showToast(copy.branchReplyTitle, copy.saveReplySuccess || copy.btnSaveReplyTxt, "good");
          } catch (actionError) {
            showToast(copy.ticketLoadError, actionError?.message || copy.ticketLoadError, "bad");
          } finally {
            setBusy(false);
          }
        }}
        onSaveResolution={async (_ticketId, resolutionForm) => {
          if (!selectedTicket?.rowId) return;

          const payload = {
            ...resolutionForm,
            resolution_handled_by: resolutionForm.resolution_handled_by || profile?.name || profile?.email || "",
            resolution_date: resolutionForm.resolution_date ? new Date(`${resolutionForm.resolution_date}T00:00:00`).toISOString() : null,
          };

          setBusy(true);
          try {
            await saveCustomerResolution(selectedTicket.rowId, payload);
            showToast(copy.customerResolutionTitle, copy.resolutionSavedText, "good");
          } catch (actionError) {
            showToast(copy.ticketLoadError, actionError?.message || copy.ticketLoadError, "bad");
          } finally {
            setBusy(false);
          }
        }}
        onMarkReplied={() => handleAction(markReplied, copy.ticketMarkedReplied || copy.btnMarkRepliedTxt)}
        onClose={() => handleAction(closeTicket, copy.closedText || copy.btnCloseTxt)}
        onAssign={() => showToast(copy.btnAssignTxt, copy.assignReady, "good")}
        onAddNote={() => showToast(copy.btnAddNoteTxt, copy.addNoteReady, "good")}
      />
      {error ? <div className="tickets-error-banner">{copy.ticketLoadError}: {error}</div> : null}
    </div>
  );
}

export default TicketsPage;
