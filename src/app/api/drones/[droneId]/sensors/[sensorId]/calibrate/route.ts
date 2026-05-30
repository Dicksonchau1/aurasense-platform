import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function POST(
  req: NextRequest,
  { params }: { params: { droneId: string; sensorId: string } }
) {
  try {
    const body = await req.json();
    const { action } = body;

    // Get current sensor state
    const { data: sensor, error: sensorError } = await supabase
      .from('sensors')
      .select('*')
      .eq('id', params.sensorId)
      .single();

    if (sensorError || !sensor) {
      return NextResponse.json(
        { error: 'Sensor not found' },
        { status: 404 }
      );
    }

    let updatedSensor = { ...sensor };
    let calibrationState = null;

    if (action === 'start') {
      updatedSensor.status = 'calibrating';
      updatedSensor.calibration_count = (sensor.calibration_count || 0) + 1;

      // Create calibration state record
      const { data: calState } = await supabase
        .from('calibration_states')
        .insert([
          {
            sensor_id: params.sensorId,
            step: 'pre_check',
            step_index: 0,
            total_steps: 8,
            progress_percent: 0,
            temperature_c: 25.0,
            started_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      calibrationState = calState;
    } else if (action === 'advance') {
      // Get latest calibration state
      const { data: calState } = await supabase
        .from('calibration_states')
        .select('*')
        .eq('sensor_id', params.sensorId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (calState) {
        const newStepIndex = Math.min(calState.step_index + 1, calState.total_steps - 1);
        const steps = [
          'pre_check',
          'collecting',
          'computing',
          'commit',
          'complete',
        ];
        const newStep = steps[newStepIndex] || 'complete';
        const newProgress = Math.round((newStepIndex / calState.total_steps) * 100);

        const { data: updated } = await supabase
          .from('calibration_states')
          .update({
            step: newStep,
            step_index: newStepIndex,
            progress_percent: newProgress,
          })
          .eq('id', calState.id)
          .select()
          .single();

        calibrationState = updated;

        if (newStepIndex >= calState.total_steps - 1) {
          updatedSensor.status = 'calibrated';
          updatedSensor.confidence = 0.95;
          updatedSensor.last_calibrated = new Date().toISOString();
        }
      }
    } else if (action === 'abort') {
      updatedSensor.status = 'idle';
      updatedSensor.confidence = 0.0;
    }

    // Update sensor
    const { data: updated, error: updateError } = await supabase
      .from('sensors')
      .update(updatedSensor)
      .eq('id', params.sensorId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sensor: updated,
      calibration_state: calibrationState,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
