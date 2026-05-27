-- Migration for @atlas/power-orchestrator
create table battery_telemetry (
  robot_id              text not null,
  ts                    timestamptz not null,
  voltage_v             real,
  current_a             real,
  soc_percent           real,
  temp_c                real,
  cells_temp_c          real[],
  cycle_count           int,
  health_percent        real,
  predicted_runtime_min real,
  primary key (robot_id, ts)
);
select create_hypertable('battery_telemetry', 'ts');

create table battery_inventory (
  serial          text primary key,
  cycle_count     int not null,
  health_percent  real not null,
  location_kind   text not null check (location_kind in ('IN_ROBOT','IN_BAY','ON_SHELF','IN_TRANSIT','QUARANTINED')),
  location_id     text,
  last_seen       timestamptz default now()
);

create table charging_bays (
  bay_id            text primary key,
  site_id           text not null,
  state             text not null,
  current_robot_id  text,
  capacity          int  not null default 1,
  batteries_ready   int  not null default 0,
  last_swap_dur_s   real
);

create table battery_swap_events (
  event_id            uuid primary key,
  robot_id            text not null,
  bay_id              text not null,
  event_type          text not null,
  ts                  timestamptz not null,
  duration_ms         int,
  failure_reason      text,
  pre_soc             real,
  post_soc            real,
  removed_serial      text,
  installed_serial    text,
  chain_hash          text not null,
  prev_chain_hash     text
);
create index on battery_swap_events (robot_id, ts desc);
create index on battery_swap_events (bay_id, ts desc);
