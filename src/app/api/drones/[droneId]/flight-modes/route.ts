import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

const ARDUPILOT_MODES = {
  COPTER: [
    'STABILIZE',
    'ACRO',
    'ALT_HOLD',
    'AUTO',
    'GUIDED',
    'LOITER',
    'RTH',
    'CIRCLE',
    'LAND',
    'DRIFT',
    'SPORT',
    'FLIP',
    'AUTOTUNE',
    'POSHOLD',
    'BRAKE',
    'THROW',
    'AVOID_ADSB',
    'GUIDED_NOGPS',
    'SMART_RTH',
  ],
  PLANE: [
    'MANUAL',
    'CIRCLE',
    'STABILIZE',
    'TRAINING',
    'ACRO',
    'FLY_BY_WIRE_A',
    'FLY_BY_WIRE_B',
    'CRUISE',
    'AUTOTUNE',
    'AUTO',
    'RTH',
    'LOITER',
    'TAKEOFF',
    'AVOID_ADSB',
    'GUIDED',
    'INITIALIZING',
    'QSTABILIZE',
    'QHOVER',
    'QLOITER',
    'QLAND',
    'QRTL',
    'QAUTOTUNE',
  ],
};

export async function GET(
  req: NextRequest,
  { params }: { params: { droneId: string } }
) {
  try {
    // Get drone model
    const { data: drone } = await supabase
      .from('drones')
      .select('model')
      .eq('id', params.droneId)
      .single();

    // Get flight modes for this drone
    const { data, error } = await supabase
      .from('flight_modes')
      .select('*')
      .eq('drone_id', params.droneId)
      .order('created_at', { ascending: true });

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      modes: data,
      available_modes: drone?.model ? ARDUPILOT_MODES[drone.model as keyof typeof ARDUPILOT_MODES] || [] : [],
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { droneId: string } }
) {
  try {
    const body = await req.json();
    const { mode_name, armed } = body;

    // First, deactivate all other modes
    await supabase
      .from('flight_modes')
      .update({ is_active: false })
      .eq('drone_id', params.droneId);

    // Check if mode exists
    const { data: existingMode } = await supabase
      .from('flight_modes')
      .select('*')
      .eq('drone_id', params.droneId)
      .eq('mode_name', mode_name)
      .single();

    let result;

    if (existingMode) {
      // Update existing mode
      const { data, error } = await supabase
        .from('flight_modes')
        .update({
          is_active: true,
          armed: armed !== undefined ? armed : existingMode.armed,
        })
        .eq('id', existingMode.id)
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      result = data;
    } else {
      // Create new mode
      const { data, error } = await supabase
        .from('flight_modes')
        .insert([
          {
            drone_id: params.droneId,
            mode_name,
            is_active: true,
            armed: armed || false,
          },
        ])
        .select()
        .single();

      if (error) {
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      result = data;
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
