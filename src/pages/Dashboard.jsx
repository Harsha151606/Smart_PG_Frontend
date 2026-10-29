import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Layout from "../components/Layout";
import {
  UserIcon,
  BedIcon,
  PaymentIcon,
  AttendanceIcon,
  ComplaintIcon,
  LeaveIcon,
  UsersIcon,
  BuildingIcon,
  AnalyticsIcon
} from "../components/Icons";

const ROLE_INFO = {
  ADMIN: { title: "System Administrator", subtitle: "Your system-wide operational snapshot.", badgeClass: "role-admin" },
  OWNER: { title: "Property Owner", subtitle: "Your properties, residents, collections and items needing action.", badgeClass: "role-owner" },
  WARDEN: { title: "Hostel Warden", subtitle: "Today's attendance, pending approvals and resident issues.", badgeClass: "role-warden" },
  STUDENT: { title: "Student Resident", subtitle: "Your room, rent, attendance and requests in one place.", badgeClass: "role-student" }
};

const money = (value) => `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
const statusIsOpen = (item) => !["RESOLVED", "CLOSED", "COMPLETED"].includes(String(item?.status || "").toUpperCase());
const statusIsPending = (item) => String(item?.status || "").toUpperCase() === "PENDING";

function MetricCard({ label, value, hint, icon, tone = "navy", onClick }) {
  return (
    <button type="button" className="stat-card-deck overview-metric" onClick={onClick} disabled={!onClick}>
      <span className="stat-info">
        <span className="stat-label">{label}</span>
        <span className="stat-value">{value}</span>
        <span className="stat-subtext">{hint}</span>
      </span>
      <span className={`stat-icon-crest ${tone}`}>{icon}</span>
    </button>
  );
}

function ActionRow({ title, detail, count, actionLabel, onClick, tone = "gold" }) {
  return (
    <div className={`overview-action-row tone-${tone}`}>
      <div className="overview-action-count">{count}</div>
      <div className="overview-action-copy">
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      <button type="button" className="btn-grand btn-secondary-grand btn-sm-grand" onClick={onClick}>
        {actionLabel} <span aria-hidden="true">→</span>
      </button>
    </div>
  );
}

function Panel({ title, subtitle, action, onAction, children }) {
  return (
    <section className="panel-card overview-panel">
      <div className="panel-card-header">
        <div>
          <h3>{title}</h3>
          {subtitle && <p className="overview-panel-subtitle">{subtitle}</p>}
        </div>
        {action && <button type="button" onClick={onAction} className="btn-grand btn-secondary-grand btn-sm-grand">{action} →</button>}
      </div>
      <div className="panel-card-body">{children}</div>
    </section>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user") || "null");
      if (!stored) {
        navigate("/login", { replace: true });
        return;
      }
      setUser(stored);
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    if (!user?.role) return undefined;
    let active = true;
    const load = async (silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError("");
      try {
        let next = {};
        if (user.role === "ADMIN") {
          const results = await Promise.allSettled([
            api.get("/admin/stats"), api.get("/admin/users"), api.get("/admin/pgs")
          ]);
          next.stats = results[0].status === "fulfilled" ? results[0].value.data : null;
          next.users = results[1].status === "fulfilled" ? (results[1].value.data || []) : [];
          next.pgs = results[2].status === "fulfilled" ? (results[2].value.data || []) : [];
          if (results.every(r => r.status === "rejected")) throw new Error("We couldn't load the admin overview. Check your connection and sign-in, then retry.");
        } else if (user.role === "OWNER") {
          const results = await Promise.allSettled([
            api.get("/owner/stats"), api.get("/owner/pgs"), api.get("/owner/rooms"),
            api.get("/owner/students"), api.get("/payments"), api.get("/complaints")
          ]);
          next.stats = results[0].status === "fulfilled" ? results[0].value.data : null;
          next.pgs = results[1].status === "fulfilled" ? (results[1].value.data || []) : [];
          next.rooms = results[2].status === "fulfilled" ? (results[2].value.data || []) : [];
          next.students = results[3].status === "fulfilled" ? (results[3].value.data || []) : [];
          next.payments = results[4].status === "fulfilled" ? (results[4].value.data || []) : [];
          next.complaints = results[5].status === "fulfilled" ? (results[5].value.data || []) : [];
          if (results.every(r => r.status === "rejected")) throw new Error("We couldn't load your property overview. Check your connection and sign-in, then retry.");
        } else if (user.role === "WARDEN") {
          const results = await Promise.allSettled([
            api.get("/warden/stats"), api.get("/warden/students"), api.get("/warden/rooms"),
            api.get("/leaves"), api.get("/complaints")
          ]);
          next.stats = results[0].status === "fulfilled" ? results[0].value.data : null;
          next.students = results[1].status === "fulfilled" ? (results[1].value.data || []) : [];
          next.rooms = results[2].status === "fulfilled" ? (results[2].value.data || []) : [];
          next.leaves = results[3].status === "fulfilled" ? (results[3].value.data || []) : [];
          next.complaints = results[4].status === "fulfilled" ? (results[4].value.data || []) : [];
          if (results.every(r => r.status === "rejected")) throw new Error("We couldn't load today's operations. Check your connection and sign-in, then retry.");
        } else {
          const profile = await api.get("/student/me");
          next.student = profile.data;
          const studentId = profile.data?.id;
          if (studentId != null) {
            const results = await Promise.allSettled([
              api.get(`/payments/student/${studentId}`),
              api.get(`/attendance/student/${studentId}`),
              api.get(`/complaints/student/${studentId}`),
              api.get(`/leaves/student/${studentId}`)
            ]);
            next.payments = results[0].status === "fulfilled" ? (results[0].value.data || []) : [];
            next.attendance = results[1].status === "fulfilled" ? (results[1].value.data || []) : [];
            next.complaints = results[2].status === "fulfilled" ? (results[2].value.data || []) : [];
            next.leaves = results[3].status === "fulfilled" ? (results[3].value.data || []) : [];
          }
        }
        if (active) setData(next);
      } catch (err) {
        if (active) setError(err.response?.data?.error || err.message || "Unable to load dashboard data.");
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
        }
      }
    };
    const onRefresh = () => load(true);
    window.addEventListener("smart-pg-refresh", onRefresh);
    load(false);
    const interval = window.setInterval(() => load(true), 30000);
    return () => {
      active = false;
      window.removeEventListener("smart-pg-refresh", onRefresh);
      window.clearInterval(interval);
    };
  }, [user]);

  const role = user?.role || "STUDENT";
  const info = ROLE_INFO[role] || ROLE_INFO.STUDENT;
  const payments = data.payments || [];
  const complaints = data.complaints || [];
  const leaves = data.leaves || [];
  const pendingLeaves = leaves.filter(statusIsPending);
  const openComplaints = complaints.filter(statusIsOpen);
  const pendingPayments = payments.filter(p => !["PAID", "COMPLETED", "SUCCESS"].includes(String(p.status || "").toUpperCase()));
  const attendancePercent = useMemo(() => {
    const records = data.attendance || [];
    if (!records.length) return null;
    const present = records.filter(a => String(a.status || "").toUpperCase() === "PRESENT").length;
    return Math.round((present / records.length) * 100);
  }, [data.attendance]);

  const shortcut = (_label, path) => { void _label; navigate(path); };

  if (!user) {
    return <Layout><div className="panel-card"><div className="panel-card-body">Preparing your secure dashboard…</div></div></Layout>;
  }

  const admin = data.stats || {};
  const owner = data.stats || {};
  const warden = data.stats || {};
  const student = data.student || {};
  const pg = student.pg || {};
  const room = student.room || {};

  return (
    <Layout>
      <section className="overview-welcome">
        <div>
          <span className="overview-eyebrow">SMART PG MANAGEMENT · {info.title.toUpperCase()}</span>
          <h1>Good to see you, {user.name?.split(" ")[0] || "there"}.</h1>
          <p>{info.subtitle}</p>
          <div className="overview-welcome-meta"><span className={`user-role-pill ${info.badgeClass}`}>{info.title}</span><span>Operational overview</span></div>
        </div>
        <button type="button" className="btn-grand btn-secondary-grand" onClick={() => window.dispatchEvent(new Event("smart-pg-refresh"))} disabled={refreshing}>
          {refreshing ? "Refreshing…" : "↻ Refresh overview"}
        </button>
      </section>

      {error && <div className="feedback-banner feedback-error" role="alert"><span>⚠️</span>{error}<button className="btn-grand btn-sm-grand btn-secondary-grand" onClick={() => window.location.reload()}>Retry</button></div>}
      {loading && <div className="overview-loading" role="status"><span className="overview-loading-dot" /> Loading the latest operational data…</div>}

      {role === "ADMIN" && (
        <>
          <section className="overview-section-heading">
            <div><h2>System at a glance</h2><p>Platform-wide totals and workload that may need attention.</p></div>
            <button className="btn-grand btn-secondary-grand btn-sm-grand" onClick={() => shortcut("analytics", "/system-stats")}>View reports →</button>
          </section>
          <div className="stat-grid overview-metric-grid">
            <MetricCard label="Users" value={admin.totalUsers ?? "—"} hint="All registered accounts" icon={<UsersIcon size={22}/>} onClick={() => shortcut("users", "/manage-users")} />
            <MetricCard label="PG properties" value={admin.totalPGs ?? "—"} hint="Registered establishments" icon={<BuildingIcon size={22}/>} tone="gold" onClick={() => shortcut("PGs", "/manage-pgs")} />
            <MetricCard label="Rooms" value={admin.totalRooms ?? "—"} hint="Configured rooms" icon={<BedIcon size={22}/>} tone="emerald" onClick={() => shortcut("rooms", "/manage-pgs")} />
            <MetricCard label="Students" value={admin.totalStudents ?? "—"} hint="Registered residents" icon={<UserIcon size={22}/>} onClick={() => shortcut("students", "/manage-users")} />
            <MetricCard label="Recorded revenue" value={money(admin.totalRevenue)} hint={`${admin.totalPayments ?? 0} recorded transactions`} icon={<PaymentIcon size={22}/>} tone="gold" />
            <MetricCard label="Complaints" value={admin.totalComplaints ?? "—"} hint="Reported in the system" icon={<ComplaintIcon size={22}/>} tone="navy" />
            <MetricCard label="Leave applications" value={admin.totalLeaves ?? "—"} hint="Submitted in the system" icon={<LeaveIcon size={22}/>} tone="emerald" />
          </div>
          <Panel title="Quick actions" subtitle="Go directly to the work that keeps the platform running.">
            <div className="overview-quick-actions">
              <button onClick={() => navigate("/manage-users")} className="overview-quick-action"><UsersIcon size={20}/><span><strong>Manage users</strong><small>Accounts and role assignments</small></span><span>→</span></button>
              <button onClick={() => navigate("/manage-pgs")} className="overview-quick-action"><BuildingIcon size={20}/><span><strong>Manage PG properties</strong><small>Register and review establishments</small></span><span>→</span></button>
              <button onClick={() => navigate("/system-stats")} className="overview-quick-action"><AnalyticsIcon size={20}/><span><strong>System analytics</strong><small>Inspect recorded system metrics</small></span><span>→</span></button>
            </div>
          </Panel>
          <Panel title="Account distribution" subtitle="Live counts based on the user directory.">
            <div className="overview-distribution">
              {["ADMIN", "OWNER", "WARDEN", "STUDENT"].map(r => {
                const count = (data.users || []).filter(u => u.role === r).length;
                const total = (data.users || []).length;
                return <div className="overview-distribution-row" key={r}><div><span>{ROLE_INFO[r].title}</span><strong>{count}</strong></div><div className="overview-track"><span style={{width: total ? `${(count / total) * 100}%` : "0%"}} /></div></div>;
              })}
            </div>
          </Panel>
        </>
      )}

      {role === "OWNER" && (
        <>
          <section className="overview-section-heading"><div><h2>Property performance</h2><p>Capacity, occupancy and operational workload across your PGs.</p></div><button className="btn-grand btn-secondary-grand btn-sm-grand" onClick={() => navigate("/owner")}>Open property management →</button></section>
          <div className="stat-grid overview-metric-grid">
            <MetricCard label="PG properties" value={owner.totalPGs ?? (data.pgs || []).length} hint="Properties you manage" icon={<BuildingIcon size={22}/>} tone="gold" onClick={() => navigate("/owner")} />
            <MetricCard label="Rooms" value={owner.totalRooms ?? (data.rooms || []).length} hint="Configured rooms" icon={<BedIcon size={22}/>} onClick={() => navigate("/manage-rooms")} />
            <MetricCard label="Bed capacity" value={owner.totalCapacity ?? "—"} hint="Maximum resident capacity" icon={<BedIcon size={22}/>} tone="emerald" />
            <MetricCard label="Occupied beds" value={owner.totalOccupied ?? "—"} hint="Currently assigned residents" icon={<UsersIcon size={22}/>} />
            <MetricCard label="Available beds" value={owner.availableCapacity ?? "—"} hint="Potential room allocations" icon={<BuildingIcon size={22}/>} tone="emerald" onClick={() => navigate("/manage-rooms")} />
            <MetricCard label="Students" value={owner.totalStudents ?? (data.students || []).length} hint="Registered residents" icon={<UserIcon size={22}/>} onClick={() => navigate("/manage-students")} />
            <MetricCard label="Open complaints" value={openComplaints.length} hint="Not yet resolved or closed" icon={<ComplaintIcon size={22}/>} tone="gold" onClick={() => navigate("/complaints-overview")} />
          </div>
          <div className="overview-two-column">
            <Panel title="Needs your attention" subtitle="A short queue of operational items.">
              {pendingPayments.length === 0 && openComplaints.length === 0 ? <div className="overview-empty"><strong>Nothing urgent in these lists.</strong><span>When unpaid payments or unresolved complaints are present, they'll appear here.</span></div> :
                <div className="overview-action-list">
                  {pendingPayments.length > 0 && <ActionRow title="Payment records to review" detail="Payment records not marked paid or completed." count={pendingPayments.length} actionLabel="Review payments" onClick={() => navigate("/payments-overview")} />}
                  {openComplaints.length > 0 && <ActionRow title="Unresolved complaints" detail="Follow up with residents and update ticket status." count={openComplaints.length} actionLabel="Review issues" onClick={() => navigate("/complaints-overview")} tone="navy" />}
                </div>}
            </Panel>
            <Panel title="Occupancy overview" subtitle="Capacity utilisation based on owner statistics.">
              {Number(owner.totalCapacity) > 0 ? <><div className="overview-big-percent">{Math.round((Number(owner.totalOccupied || 0) / Number(owner.totalCapacity)) * 100)}<small>%</small></div><div className="overview-track overview-track-large"><span style={{width:`${Math.min(100, Math.max(0, Number(owner.totalOccupied || 0) / Number(owner.totalCapacity) * 100))}%`}}/></div><div className="overview-occupancy-meta"><span>{owner.totalOccupied || 0} occupied</span><span>{owner.availableCapacity ?? Math.max(0, Number(owner.totalCapacity)-Number(owner.totalOccupied||0))} available</span></div></> : <div className="overview-empty"><strong>Occupancy data unavailable</strong><span>Once capacity and allocation data are available, utilisation will appear here.</span></div>}
              <button className="btn-grand btn-secondary-grand btn-sm-grand overview-panel-cta" onClick={() => navigate("/manage-rooms")}>Review room inventory →</button>
            </Panel>
          </div>
          <Panel title="Recent payment activity" subtitle="Latest recorded payment transactions.">
            {(data.payments || []).length === 0 ? <div className="overview-empty"><strong>No payment records found</strong><span>Once transactions are recorded, the latest activity will be shown here.</span></div> :
              <div className="table-responsive"><table className="grand-table"><thead><tr><th>Student</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead><tbody>{[...(data.payments || [])].slice(-5).reverse().map((p, i) => <tr key={p.id ?? i}><td>{p.student?.user?.name || p.student?.name || "Resident"}</td><td>{money(p.amount)}</td><td>{p.paymentDate ? String(p.paymentDate).split("T")[0] : "—"}</td><td><span className={`badge-grand ${String(p.status || "").toUpperCase() === "PAID" ? "badge-paid" : "badge-pending"}`}>{p.status || "Unspecified"}</span></td></tr>)}</tbody></table></div>}
          </Panel>
        </>
      )}

      {role === "WARDEN" && (
        <>
          <section className="overview-section-heading"><div><h2>Today's operations</h2><p>Attendance, leave decisions and resident issues for your next shift.</p></div><button className="btn-grand btn-secondary-grand btn-sm-grand" onClick={() => navigate("/warden")}>Open warden workspace →</button></section>
          <div className="stat-grid overview-metric-grid">
            <MetricCard label="Residents" value={warden.totalStudents ?? (data.students || []).length} hint="Residents in your directory" icon={<UsersIcon size={22}/>} onClick={() => navigate("/view-students")} />
            <MetricCard label="Present today" value={warden.presentToday ?? "—"} hint="Attendance records marked present" icon={<AttendanceIcon size={22}/>} tone="emerald" onClick={() => navigate("/manage-attendance")} />
            <MetricCard label="Absent today" value={warden.absentToday ?? "—"} hint="Attendance records marked absent" icon={<UserIcon size={22}/>} tone="gold" onClick={() => navigate("/manage-attendance")} />
            <MetricCard label="Pending leaves" value={warden.pendingLeaves ?? pendingLeaves.length} hint="Awaiting your decision" icon={<LeaveIcon size={22}/>} tone="gold" onClick={() => navigate("/manage-leaves")} />
            <MetricCard label="Open complaints" value={warden.openComplaints ?? openComplaints.length} hint="Awaiting follow-up" icon={<ComplaintIcon size={22}/>} onClick={() => navigate("/warden")} />
            <MetricCard label="Rooms" value={warden.totalRooms ?? (data.rooms || []).length} hint="Rooms under your watch" icon={<BedIcon size={22}/>} tone="navy" />
          </div>
          <div className="overview-two-column">
            <Panel title="Priority queue" subtitle="Start with outstanding actions.">
              <div className="overview-action-list">
                <ActionRow title="Attendance roll call" detail="Open the attendance page and record residents for today." count={warden.presentToday == null ? "—" : warden.presentToday} actionLabel="Mark attendance" onClick={() => navigate("/manage-attendance")} tone="navy" />
                <ActionRow title="Leave decisions" detail="Review leave requests that are still pending." count={pendingLeaves.length} actionLabel="Review requests" onClick={() => navigate("/manage-leaves")} />
                <ActionRow title="Resident complaints" detail="Review open facility and maintenance issues." count={openComplaints.length} actionLabel="Review complaints" onClick={() => navigate("/warden")} tone="navy" />
              </div>
            </Panel>
            <Panel title="Attendance completion" subtitle="Completion based on current daily summary values.">
              {Number(warden.totalStudents ?? (data.students || []).length) > 0 && warden.presentToday != null && warden.absentToday != null ?
                <><div className="overview-big-percent">{Math.round(((Number(warden.presentToday)+Number(warden.absentToday))/(Number(warden.totalStudents ?? (data.students || []).length)||1))*100)}<small>%</small></div><div className="overview-track overview-track-large"><span style={{width:`${Math.min(100, Math.max(0, (Number(warden.presentToday)+Number(warden.absentToday))/(Number(warden.totalStudents ?? (data.students || []).length)||1)*100))}%`}}/></div><div className="overview-occupancy-meta"><span>{Number(warden.presentToday)+Number(warden.absentToday)} marked</span><span>{Math.max(0, Number(warden.totalStudents ?? (data.students || []).length)-Number(warden.presentToday)-Number(warden.absentToday))} not yet marked</span></div></> :
                <div className="overview-empty"><strong>Today's attendance summary isn't available</strong><span>Open attendance to see and record the resident roll call.</span></div>}
              <button className="btn-grand btn-secondary-grand btn-sm-grand overview-panel-cta" onClick={() => navigate("/manage-attendance")}>Open attendance →</button>
            </Panel>
          </div>
        </>
      )}

      {role === "STUDENT" && (
        <>
          <section className="overview-section-heading"><div><h2>Your stay at a glance</h2><p>Personal details and the items you may need to act on.</p></div><button className="btn-grand btn-secondary-grand btn-sm-grand" onClick={() => navigate("/my-room")}>View room details →</button></section>
          <div className="stat-grid overview-metric-grid">
            <MetricCard label="Assigned room" value={room.roomNumber ? `Room ${room.roomNumber}` : "Not assigned"} hint={pg.name || "Your PG property"} icon={<BedIcon size={22}/>} tone="gold" onClick={() => navigate("/my-room")} />
            <MetricCard label="Monthly rent" value={room.rent != null ? money(room.rent) : "—"} hint="Based on your room assignment" icon={<PaymentIcon size={22}/>} onClick={() => navigate("/my-rent")} />
            <MetricCard label="Attendance" value={attendancePercent == null ? "—" : `${attendancePercent}%`} hint={data.attendance?.length ? `${data.attendance.length} recorded entries` : "No attendance records available"} icon={<AttendanceIcon size={22}/>} tone="emerald" onClick={() => navigate("/attendance")} />
            <MetricCard label="Pending payment records" value={pendingPayments.length} hint="Records not marked paid" icon={<PaymentIcon size={22}/>} tone="gold" onClick={() => navigate("/my-rent")} />
            <MetricCard label="Open complaints" value={openComplaints.length} hint="Requests not yet resolved" icon={<ComplaintIcon size={22}/>} onClick={() => navigate("/complaints")} />
            <MetricCard label="Pending leave requests" value={pendingLeaves.length} hint="Waiting for a decision" icon={<LeaveIcon size={22}/>} tone="navy" onClick={() => navigate("/leave-request")} />
          </div>
          <div className="overview-two-column">
            <Panel title="Your open requests" subtitle="Track requests that still need an update.">
              <div className="overview-action-list">
                {openComplaints.length > 0 && <ActionRow title="Complaint updates" detail="Review the status of open maintenance and facility requests." count={openComplaints.length} actionLabel="Track complaints" onClick={() => navigate("/complaints")} tone="navy" />}
                {pendingLeaves.length > 0 && <ActionRow title="Leave approval" detail="Check the progress of your submitted leave request." count={pendingLeaves.length} actionLabel="Track leave" onClick={() => navigate("/leave-request")} />}
                {pendingPayments.length > 0 && <ActionRow title="Rent records" detail="Review payment records and outstanding statuses." count={pendingPayments.length} actionLabel="Review rent" onClick={() => navigate("/my-rent")} tone="gold" />}
                {openComplaints.length === 0 && pendingLeaves.length === 0 && pendingPayments.length === 0 && <div className="overview-empty"><strong>No open items detected</strong><span>When requests or payment records need attention, they'll be listed here.</span></div>}
              </div>
            </Panel>
            <Panel title="Quick actions" subtitle="Common tasks, one click away.">
              <div className="overview-quick-actions">
                <button onClick={() => navigate("/my-room")} className="overview-quick-action"><BedIcon size={20}/><span><strong>My room</strong><small>Room, PG and roommate details</small></span><span>→</span></button>
                <button onClick={() => navigate("/my-rent")} className="overview-quick-action"><PaymentIcon size={20}/><span><strong>Rent & dues</strong><small>Payment history and status</small></span><span>→</span></button>
                <button onClick={() => navigate("/complaints")} className="overview-quick-action"><ComplaintIcon size={20}/><span><strong>Raise a complaint</strong><small>Report maintenance issues</small></span><span>→</span></button>
                <button onClick={() => navigate("/leave-request")} className="overview-quick-action"><LeaveIcon size={20}/><span><strong>Request leave</strong><small>Submit and track a request</small></span><span>→</span></button>
              </div>
            </Panel>
          </div>
        </>
      )}
    </Layout>
  );
}

export default Dashboard;
