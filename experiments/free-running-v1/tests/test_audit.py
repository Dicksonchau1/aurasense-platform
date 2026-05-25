from lib.audit import AuditChainLogger
import time

def test_audit(tmp_path):
    path = tmp_path / "audit.jsonl"
    logger = AuditChainLogger(str(path))
    t0 = time.time()
    for i in range(10):
        logger.log({"timestamp": t0 + i*10})
    result = logger.verify_coverage(t0, t0+90, max_gap_s=15)
    assert result["gap_count"] == 0
    logger.close()
