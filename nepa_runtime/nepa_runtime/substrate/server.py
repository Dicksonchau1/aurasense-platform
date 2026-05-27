

@app.get("/health")
def health() -> dict[str, Any]:
    st = get_state()
    return {
        "status": "ok",
        "run_id": st.run_id,
        "tick_count": st.tick_count,
        "priors_loaded": st.priors_loaded,
        "dopamine_level": st.dopamine_level,
        "channels": len(st.channels),
    }


@app.get("/substrate/state")
def get_full_state() -> dict[str, Any]:
    """Debug-only: dump full substrate state. Disable in prod."""
    return get_state().model_dump()


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("NEPA_SUBSTRATE_PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)


@app.get("/health")
def health() -> dict[str, Any]:
    st = get_state()
    return {
        "status": "ok",
        "run_id": st.run_id,
        "tick_count": st.tick_count,
        "priors_loaded": st.priors_loaded,
        "dopamine_level": st.dopamine_level,
        "channels": len(st.channels),
    }


@app.get("/substrate/state")
def get_full_state() -> dict[str, Any]:
    """Debug-only: dump full substrate state. Disable in prod."""
    return get_state().model_dump()


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("NEPA_SUBSTRATE_PORT", "8080"))
    uvicorn.run(app, host="0.0.0.0", port=port)
